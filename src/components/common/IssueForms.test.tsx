import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosAdapter } from 'axios';
import { ReactNode, useState } from 'react';
import { Provider } from 'jotai';
import { Toaster, toast } from 'sonner';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '../../api';
import { existingIssue, project } from '../../test/issueFixtures';
import { DiscreteProbability, Issue } from '../../validators';
import { ProjectContext } from '../ProjectPage/ProjectContext';
import { IssueRow } from '../ProjectPage/ProjectIssues/ListView/IssueRow';
import { IssueCard, IssueCardEditMenuItem, IssueCardMenu } from './Cards/IssueCard';
import { CreateIssueButton } from './CreateIssueButton';
import { CreateIssueToolbarButton } from './CreateIssueToolbarButton';
import { EditIssueSheet } from './EditIssueSheet/EditIssueSheet';
import { useInfluenceDiagramEvidence } from '../../hooks/useInfluenceDiagramEvidence';
import { useSelectedProjectIssues } from '../../hooks/useSelectedProjectIssues';

const createIssueButtons = [
	{ label: 'regular button', CreateIssue: CreateIssueButton },
	{ label: 'toolbar button', CreateIssue: CreateIssueToolbarButton },
];

const ProjectIssueEditor = ({
	issueId,
	open,
	onClose,
}: {
	issueId: string;
	open: boolean;
	onClose: (open: boolean) => void;
}) => {
	const issues = useSelectedProjectIssues();
	const issue = issues.find(issue => issue.id === issueId);
	if (!issue) return null;
	return <EditIssueSheet issue={issue} open={open} onClose={onClose} />;
};

let savedIssues: Issue[];
let savedRequests: { method: string; url: string | undefined }[];

const adapter: AxiosAdapter = async config => {
	if (config.method === 'post' || config.method === 'put') {
		savedIssues.push(...JSON.parse(config.data));
		savedRequests.push({ method: config.method, url: config.url });
	}
	if (config.method === 'delete') {
		savedRequests.push({ method: config.method, url: config.url });
	}
	return {
		config,
		status: 200,
		statusText: 'OK',
		headers: {},
		data:
			config.url === '/issues'
				? Array.from(new Map(savedIssues.map(issue => [issue.id, issue])).values())
				: [],
	};
};

const renderForm = (
	children: ReactNode,
	issues: Issue[] = [],
	probabilities: DiscreteProbability[] = [],
) => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false, staleTime: Infinity },
			mutations: { retry: false },
		},
	});
	queryClient.setQueryData(['issues'], issues);
	for (const key of ['edges', 'nodes', 'probabilityTables', 'restrictionTables']) {
		queryClient.setQueryData([key], []);
	}
	queryClient.setQueryData(['probabilityTables'], probabilities);
	return render(
		<QueryClientProvider client={queryClient}>
			<Provider>
				<ProjectContext value={project}>{children}</ProjectContext>
			</Provider>
		</QueryClientProvider>,
	);
};

beforeEach(() => {
	savedIssues = [];
	savedRequests = [];
	apiClient.interceptors.request.clear();
	apiClient.defaults.adapter = adapter;
});
afterEach(() => toast.dismiss());

describe('full issue forms', () => {
	it.each([true, false])(
		'keeps Details when deletion is cancelled and unmounts after confirming deletion (dialog=%s)',
		async dialog => {
			const user = userEvent.setup();
			const issue = existingIssue();
			const ControlledEdit = () => {
				const [open, setOpen] = useState(false);
				const issues = useSelectedProjectIssues();
				return (
					<>
						<button onClick={() => setOpen(true)}>Open Edit</button>
						{issues.map(issue => (
							<EditIssueSheet
								key={issue.id}
								issue={issue}
								open={open}
								dialog={dialog}
								onClose={setOpen}
							/>
						))}
					</>
				);
			};
			renderForm(<ControlledEdit />, [issue]);
			await user.click(screen.getByRole('button', { name: 'Open Edit' }));
			await user.type(screen.getByRole('textbox', { name: 'Issue name' }), ' edited');
			await user.click(screen.getByRole('button', { name: 'Delete decision' }));
			await user.click(screen.getByRole('button', { name: 'Cancel' }));
			expect(screen.getByRole('textbox', { name: 'Issue name' })).toHaveValue(
				`${issue.name} edited`,
			);
			await user.click(screen.getByRole('button', { name: 'Delete decision' }));
			await user.click(screen.getByRole('button', { name: 'Delete' }));
			await waitFor(() =>
				expect(
					screen.queryByRole('dialog', { name: 'Edit Issue' }),
				).not.toBeInTheDocument(),
			);
			await waitFor(() =>
				expect(savedRequests).toEqual([{ method: 'delete', url: `/issues/${issue.id}` }]),
			);
		},
	);

	it('offers a disabled Utility table with its parent-edge explanation, but no tables for excluded Issues', async () => {
		const issue = { ...existingIssue(), type: 'Utility' as const, boundary: 'in' as const };
		const { unmount } = renderForm(<EditIssueSheet issue={issue} open onClose={vi.fn()} />, [
			issue,
		]);
		expect(screen.getByRole('tab', { name: 'Utility table' })).toHaveAttribute(
			'aria-disabled',
			'true',
		);
		expect(
			screen.getByText('Connect 2+ parent nodes to enable utility table and solver'),
		).toBeInTheDocument();
		unmount();
		renderForm(
			<EditIssueSheet issue={{ ...issue, boundary: 'out' }} open onClose={vi.fn()} />,
			[issue],
		);
		expect(screen.queryByRole('tab', { name: /table/ })).not.toBeInTheDocument();
	});

	it('keeps the workspace interactive while the sheet is open', async () => {
		const user = userEvent.setup();
		const issue = existingIssue();
		const Workspace = () => {
			const [open, setOpen] = useState(false);
			return (
				<>
					<button onClick={() => setOpen(true)}>Open Edit</button>
					<button>Ordinary selection</button>
					<EditIssueSheet issue={issue} open={open} dialog={false} onClose={setOpen} />
				</>
			);
		};
		renderForm(<Workspace />, [issue]);
		await user.click(screen.getByRole('button', { name: 'Open Edit' }));
		await user.type(screen.getByRole('textbox', { name: 'Issue name' }), ' unsaved');
		await user.click(screen.getByRole('button', { name: 'Ordinary selection' }));
		expect(screen.getByRole('button', { name: 'Ordinary selection' })).toHaveFocus();
		expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-modal', 'true');
		expect(document.body.style.overflow).not.toBe('hidden');
		expect(document.querySelector('[data-backdrop]')).not.toBeInTheDocument();
		expect(screen.getByRole('textbox', { name: 'Issue name' })).toHaveValue(
			`${issue.name} unsaved`,
		);
	});

	it.each(['card', 'list'] as const)(
		'opens a modal sheet with a dismissible scrim from the %s view',
		async view => {
			const user = userEvent.setup();
			const issue = existingIssue();
			renderForm(
				view === 'card' ? (
					<IssueCard issue={issue}>
						<IssueCardMenu>
							<IssueCardEditMenuItem />
						</IssueCardMenu>
					</IssueCard>
				) : (
					<table>
						<tbody>
							<IssueRow issue={issue} />
						</tbody>
					</table>
				),
				[issue],
			);
			if (view === 'card') {
				await user.click(screen.getByRole('button', { name: 'Issue actions' }));
				await user.click(screen.getByRole('menuitem', { name: 'Edit' }));
			} else {
				await user.click(screen.getByRole('button', { name: /^Edit issue:/ }));
			}
			const sheet = screen.getByRole('dialog', { name: 'Edit Issue' });
			await waitFor(() =>
				expect([
					document.body.style.overflow,
					document.documentElement.style.overflowY,
				]).toContain('hidden'),
			);
			const scrim = document.querySelector(`[data-backdrop="${sheet.id}"]`);
			expect(scrim).toHaveClass('bg-black/40');
			if (!(scrim instanceof HTMLElement)) throw new Error('Missing sheet scrim');
			await user.type(screen.getByRole('textbox', { name: 'Issue name' }), ' unsaved');
			await user.click(scrim);
			await waitFor(() => expect(sheet).not.toBeInTheDocument());
			expect(savedIssues).toHaveLength(0);
			expect(document.querySelector('[data-backdrop]')).not.toBeInTheDocument();
			expect(document.body.style.overflow).not.toBe('hidden');
			expect(document.documentElement.style.overflowY).not.toBe('hidden');
		},
	);

	it('keeps immediate evidence independent of Details, disallows unsaved States and clears a successfully deleted override', async () => {
		const user = userEvent.setup();
		const issue = existingIssue();
		const Evidence = () => {
			const { evidence } = useInfluenceDiagramEvidence();
			return <output aria-label='Evidence'>{evidence.join(',')}</output>;
		};
		const ControlledEdit = () => {
			const [open, setOpen] = useState(true);
			return (
				<>
					<button onClick={() => setOpen(true)}>Reopen</button>
					<ProjectIssueEditor issueId={issue.id} open={open} onClose={setOpen} />
				</>
			);
		};
		renderForm(
			<>
				<ControlledEdit />
				<Evidence />
			</>,
			[issue],
		);
		const override = screen.getByRole('radio', { name: 'Override option 1' });
		await user.click(override);
		expect(screen.getByLabelText('Evidence')).toHaveTextContent(issue.decision.options[0].id);
		expect(screen.getByRole('button', { name: 'Update decision' })).toBeDisabled();
		await user.click(override);
		expect(screen.getByLabelText('Evidence')).toBeEmptyDOMElement();
		await user.click(override);
		await user.type(screen.getByRole('textbox', { name: 'Issue name' }), ' discarded');
		await user.click(screen.getByRole('button', { name: 'Discard changes' }));
		expect(screen.getByLabelText('Evidence')).toHaveTextContent(issue.decision.options[0].id);
		await user.click(screen.getByRole('button', { name: 'Reopen' }));
		await user.click(screen.getByRole('button', { name: 'Add option' }));
		expect(screen.getByRole('radio', { name: 'Override option 2' })).toBeDisabled();
		await user.type(screen.getByRole('textbox', { name: 'Option 2 name' }), 'New option');
		await user.click(screen.getByRole('button', { name: 'Update decision' }));
		await waitFor(() =>
			expect(screen.getByRole('radio', { name: 'Override option 2' })).toBeEnabled(),
		);
		await user.click(screen.getByRole('button', { name: 'Remove option 1' }));
		expect(screen.getByLabelText('Evidence')).toHaveTextContent(issue.decision.options[0].id);
		await user.click(screen.getByRole('button', { name: 'Update decision' }));
		await waitFor(() => expect(screen.getByLabelText('Evidence')).toBeEmptyDOMElement());
		await user.click(screen.getByRole('radio', { name: 'Override option 1' }));
		await user.click(screen.getByRole('button', { name: 'Issue type: Decision' }));
		await user.click(screen.getByRole('menuitem', { name: 'Uncertainty' }));
		expect(screen.getByRole('radio', { name: 'Override outcome 1' })).toBeDisabled();
		await user.click(screen.getByRole('button', { name: 'Update uncertainty' }));
		await waitFor(() => expect(screen.getByLabelText('Evidence')).toBeEmptyDOMElement());
		expect(screen.getByRole('radio', { name: 'Override outcome 1' })).toBeEnabled();
	});

	it('keeps dirty Details across tabs, disables table mutations, and stays open on Details after exclusion', async () => {
		const user = userEvent.setup();
		const issue = { ...existingIssue(), type: 'Uncertainty' as const, boundary: 'in' as const };
		const probability = {
			id: crypto.randomUUID(),
			outcome_id: issue.uncertainty.outcomes[0].id,
			uncertainty_id: issue.uncertainty.id,
			project_id: project.id,
			parent_option_ids: [],
			parent_outcome_ids: [],
			probability: 1,
		};
		renderForm(
			<ProjectIssueEditor issueId={issue.id} open onClose={vi.fn()} />,
			[issue],
			[probability],
		);
		await user.click(screen.getByRole('tab', { name: 'Probability table' }));
		expect(screen.getByRole('spinbutton')).toBeEnabled();
		expect(screen.getByRole('spinbutton').closest('[inert]')).toBeNull();
		expect(screen.getByRole('button', { name: 'Reset all' })).toBeInTheDocument();
		await user.click(screen.getByRole('tab', { name: 'Details' }));
		await user.type(screen.getByRole('textbox', { name: 'Issue name' }), ' edited');
		await user.click(screen.getByRole('switch', { name: 'Is key' }));
		expect(
			screen.getByText(
				'Only key uncertainties are shown in the influence diagram. Updating will remove this node.',
			),
		).toBeInTheDocument();
		await user.click(screen.getByRole('tab', { name: 'Probability table' }));
		expect(
			screen.getByText('The table is disabled until your changes are saved'),
		).toBeInTheDocument();
		expect(screen.getByRole('spinbutton').closest('[inert]')).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: 'Reset all' }).closest('[inert]'),
		).toBeInTheDocument();
		await user.click(screen.getByRole('button', { name: 'Update uncertainty' }));
		await waitFor(() =>
			expect(
				screen.queryByRole('tab', { name: 'Probability table' }),
			).not.toBeInTheDocument(),
		);
		expect(screen.getByRole('textbox', { name: 'Issue name' })).toHaveValue(
			`${issue.name} edited`,
		);
		expect(screen.getByRole('dialog')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Update uncertainty' })).toBeDisabled();
	});

	it('retains clean table selection after saving and warns about boundary exclusion on either tab', async () => {
		const user = userEvent.setup();
		const issue = { ...existingIssue(), type: 'Uncertainty' as const, boundary: 'in' as const };
		renderForm(<ProjectIssueEditor issueId={issue.id} open onClose={vi.fn()} />, [issue]);
		await user.click(screen.getByRole('button', { name: 'Boundary: In' }));
		await user.click(screen.getByRole('menuitem', { name: 'Out' }));
		await user.click(screen.getByRole('tab', { name: 'Probability table' }));
		expect(
			screen.getByText(
				'Issues outside the boundary aren’t shown in the influence diagram. Updating will remove this node.',
			),
		).toBeInTheDocument();
		await user.click(screen.getByRole('button', { name: 'Boundary: Out' }));
		await user.click(screen.getByRole('menuitem', { name: 'On' }));
		await user.click(screen.getByRole('button', { name: 'Update uncertainty' }));
		await waitFor(() =>
			expect(screen.getByRole('button', { name: 'Update uncertainty' })).toBeDisabled(),
		);
		expect(screen.getByRole('tab', { name: 'Probability table' })).toHaveAttribute(
			'aria-selected',
			'true',
		);
		expect(
			screen.queryByText('The table is disabled until your changes are saved'),
		).not.toBeInTheDocument();
	});

	it.each(['Discard changes', 'Escape'])(
		'discards unsaved Edit changes with %s',
		async closeLabel => {
			const user = userEvent.setup();
			const issue = existingIssue();
			const ControlledEdit = () => {
				const [open, setOpen] = useState(true);
				return (
					<>
						<button onClick={() => setOpen(true)}>Open Edit</button>
						<EditIssueSheet issue={issue} open={open} onClose={setOpen} />
					</>
				);
			};
			renderForm(<ControlledEdit />);
			await user.clear(screen.getByRole('textbox', { name: /issue name/i }));
			await user.type(screen.getByRole('textbox', { name: /issue name/i }), 'Unsaved name');
			await user.click(screen.getByRole('button', { name: 'Issue type: Decision' }));
			await user.click(screen.getByRole('menuitem', { name: 'Fact' }));
			if (closeLabel === 'Escape') {
				await user.click(screen.getByRole('textbox', { name: /issue name/i }));
				await user.keyboard('{Escape}');
			} else await user.click(screen.getByRole('button', { name: closeLabel }));
			expect(screen.queryByRole('dialog', { name: 'Edit Issue' })).not.toBeInTheDocument();
			await user.click(screen.getByRole('button', { name: 'Open Edit' }));
			expect(screen.getByRole('textbox', { name: /issue name/i })).toHaveValue(
				' Existing issue ',
			);
			expect(
				screen.getByRole('button', { name: 'Issue type: Decision' }),
			).toBeInTheDocument();
			expect(screen.getByRole('radio', { name: 'Tactical' })).toBeChecked();
			expect(savedIssues).toHaveLength(0);
		},
	);

	it.each(['Unassigned', 'Decision', 'Uncertainty', 'Fact', 'Utility'] as const)(
		'edits %s through the whole-issue API while preserving unedited values',
		async type => {
			const user = userEvent.setup();
			const issue = { ...existingIssue(), type };
			const onClose = vi.fn();
			renderForm(<EditIssueSheet issue={issue} open onClose={onClose} />);
			await user.click(screen.getByRole('button', { name: 'Boundary: Out' }));
			await user.click(screen.getByRole('menuitem', { name: 'On' }));
			await user.clear(screen.getByRole('textbox', { name: /issue name/i }));
			await user.type(screen.getByRole('textbox', { name: /issue name/i }), ' Updated name ');
			await user.clear(screen.getByRole('textbox', { name: 'Description' }));
			await user.type(
				screen.getByRole('textbox', { name: 'Description' }),
				' First paragraph ',
			);
			await user.keyboard('{Shift>}{Enter}{/Shift}');
			await user.keyboard(' Second paragraph {Enter}');
			await waitFor(() => expect(savedIssues).toHaveLength(1));
			expect(savedIssues[0]).toEqual({
				...issue,
				boundary: 'on',
				name: ' Updated name ',
				description: ' First paragraph \n Second paragraph ',
			});
			expect(savedRequests).toEqual([{ method: 'put', url: '/issues' }]);
			expect(onClose).not.toHaveBeenCalled();
			expect(
				screen.getByRole('button', { name: `Update ${type.toLowerCase()}` }),
			).toBeDisabled();
		},
	);

	it.each(['Create', 'Edit'] as const)(
		'%s rejects missing issue name and description with accessible required-field messages',
		async mode => {
			const user = userEvent.setup();
			const issue = { ...existingIssue(), name: '   ', description: '  \n ' };
			renderForm(
				mode === 'Create' ? (
					<CreateIssueButton />
				) : (
					<EditIssueSheet issue={issue} open onClose={vi.fn()} />
				),
			);
			if (mode === 'Create') {
				await user.click(screen.getByRole('button', { name: 'Create Issue' }));
			} else {
				await user.type(screen.getByRole('textbox', { name: /issue name/i }), ' ');
			}
			await user.click(
				screen.getByRole('button', {
					name: mode === 'Create' ? 'Add Issue' : 'Update decision',
				}),
			);
			expect(await screen.findByText('Issue name is required')).toHaveAttribute(
				'role',
				'alert',
			);
			expect(screen.getByText('Issue description is required')).toHaveAttribute(
				'role',
				'alert',
			);
			expect(screen.getByRole('textbox', { name: /issue name/i })).toHaveAttribute(
				'aria-invalid',
				'true',
			);
			expect(screen.getByRole('textbox', { name: /issue name/i })).toHaveFocus();
			expect(savedIssues).toHaveLength(0);
		},
	);

	it.each(['Create', 'Edit'] as const)(
		'%s reports a failed save, preserves its draft and allows retry',
		async mode => {
			const user = userEvent.setup();
			const onClose = vi.fn();
			const issue = existingIssue();
			const submitLabel = mode === 'Create' ? 'Add Issue' : 'Update decision';
			apiClient.defaults.adapter = async config => {
				if (config.method === 'post' || config.method === 'put') {
					throw new Error('Network unavailable');
				}
				return adapter(config);
			};
			renderForm(
				<>
					{mode === 'Create' ? (
						<CreateIssueButton />
					) : (
						<EditIssueSheet issue={issue} open onClose={onClose} />
					)}
					<Toaster />
				</>,
			);
			if (mode === 'Create') {
				await user.click(screen.getByRole('button', { name: 'Create Issue' }));
			}
			await user.clear(screen.getByRole('textbox', { name: /issue name/i }));
			await user.type(screen.getByRole('textbox', { name: /issue name/i }), ' Draft name ');
			await user.clear(screen.getByRole('textbox', { name: 'Description' }));
			await user.type(
				screen.getByRole('textbox', { name: 'Description' }),
				' Draft description ',
			);
			await user.click(screen.getByRole('button', { name: submitLabel }));
			expect(
				await screen.findByText(
					mode === 'Create' ? 'Failed to create issue' : 'Failed to update issue',
				),
			).toBeInTheDocument();
			await waitFor(() =>
				expect(screen.getByRole('button', { name: submitLabel })).toBeEnabled(),
			);
			expect(screen.getByRole('textbox', { name: /issue name/i })).toHaveValue(
				' Draft name ',
			);
			expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue(
				' Draft description ',
			);
			expect(savedIssues).toHaveLength(0);
			expect(onClose).not.toHaveBeenCalled();
			apiClient.defaults.adapter = adapter;
			await user.click(screen.getByRole('button', { name: submitLabel }));
			await waitFor(() => expect(savedIssues).toHaveLength(1));
			expect(savedIssues[0]).toMatchObject({
				name: ' Draft name ',
				description: ' Draft description ',
			});
		},
	);

	it.each(['Create', 'Edit'] as const)(
		'does not submit %s again while the whole-issue request is pending',
		async mode => {
			const user = userEvent.setup();
			const response = Promise.withResolvers<void>();
			let attempts = 0;
			apiClient.defaults.adapter = async config => {
				if (config.method === 'post' || config.method === 'put') {
					attempts++;
					await response.promise;
				}
				return adapter(config);
			};
			const onClose = vi.fn();
			renderForm(
				mode === 'Create' ? (
					<CreateIssueButton />
				) : (
					<EditIssueSheet issue={existingIssue()} open onClose={onClose} />
				),
			);
			if (mode === 'Create') {
				await user.click(screen.getByRole('button', { name: 'Create Issue' }));
			}
			await user.clear(screen.getByRole('textbox', { name: /issue name/i }));
			await user.type(screen.getByRole('textbox', { name: /issue name/i }), 'Pending issue');
			await user.clear(screen.getByRole('textbox', { name: 'Description' }));
			await user.type(
				screen.getByRole('textbox', { name: 'Description' }),
				'Draft description',
			);
			await user.keyboard('{Enter}');
			await waitFor(() => expect(attempts).toBe(1));
			const submitLabel = mode === 'Create' ? 'Add Issue' : 'Update decision';
			expect(screen.getByRole('button', { name: submitLabel })).toBeDisabled();
			expect(screen.getByRole('textbox', { name: 'Description' })).toBeDisabled();
			await user.keyboard('{Enter}{Enter}');
			response.resolve();
			if (mode === 'Create') {
				await waitFor(() =>
					expect(
						screen.queryByRole('textbox', { name: 'Description' }),
					).not.toBeInTheDocument(),
				);
			} else {
				await waitFor(() =>
					expect(screen.getByRole('button', { name: submitLabel })).toBeDisabled(),
				);
				expect(onClose).not.toHaveBeenCalled();
			}
			expect(attempts).toBe(1);
			expect(savedIssues).toHaveLength(1);
		},
	);

	it('labels Edit as a dialog and preserves all nested data while changing issue type', async () => {
		const user = userEvent.setup();
		const issue = existingIssue();
		const onClose = vi.fn();
		renderForm(<EditIssueSheet issue={issue} open onClose={onClose} />);
		const editor = within(screen.getByRole('dialog', { name: 'Edit Issue' }));
		expect(editor.getByRole('textbox', { name: /issue name/i })).toHaveValue(
			' Existing issue ',
		);
		expect(editor.getByRole('button', { name: 'Boundary: Out' })).toBeInTheDocument();
		expect(editor.getByRole('radio', { name: 'Tactical' })).toBeChecked();
		const changeType = async (type: string, from: string) => {
			await user.click(editor.getByRole('button', { name: `Issue type: ${from}` }));
			await user.click(screen.getByRole('menuitem', { name: type }));
		};
		await changeType('Uncertainty', 'Decision');
		expect(editor.getByRole('switch', { name: 'Is key' })).toBeChecked();
		expect(editor.getByRole('textbox', { name: 'Outcome 1 name' })).toHaveValue(
			'Existing outcome',
		);
		await changeType('Fact', 'Uncertainty');
		await changeType('Decision', 'Fact');
		expect(editor.getByRole('radio', { name: 'Tactical' })).toBeChecked();
		expect(editor.getByRole('textbox', { name: 'Option 1 name' })).toHaveValue(
			'Existing option',
		);
		await changeType('Utility', 'Decision');
		await user.click(editor.getByRole('button', { name: 'Update utility' }));
		await waitFor(() => expect(savedIssues).toHaveLength(1));
		expect(savedIssues[0]).toEqual({ ...issue, type: 'Utility' });
		expect(onClose).not.toHaveBeenCalled();
	});

	it.each(createIssueButtons)(
		'closes Create without losing the draft ($label)',
		async ({ CreateIssue }) => {
			const user = userEvent.setup();
			renderForm(<CreateIssue />);
			await user.click(screen.getByRole('button', { name: 'Create Issue' }));
			await user.type(screen.getByRole('textbox', { name: /issue name/i }), 'Draft');
			await user.type(
				screen.getByRole('textbox', { name: 'Description' }),
				'Draft description',
			);
			await user.click(screen.getByRole('radio', { name: 'Decision' }));
			await user.click(screen.getByRole('button', { name: 'Add Option' }));
			await user.type(screen.getByRole('textbox', { name: 'Option 1' }), 'Draft option');
			await user.click(screen.getByRole('button', { name: 'Close Create Issue' }));
			expect(screen.queryByRole('textbox', { name: /issue name/i })).not.toBeInTheDocument();
			await user.click(screen.getByRole('button', { name: 'Create Issue' }));
			expect(screen.getByRole('textbox', { name: /issue name/i })).toHaveValue('Draft');
			expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue(
				'Draft description',
			);
			expect(screen.getByRole('radio', { name: 'Decision' })).toBeChecked();
			expect(screen.getByRole('textbox', { name: 'Option 1' })).toHaveValue('Draft option');
			expect(savedIssues).toHaveLength(0);
		},
	);

	it.each(createIssueButtons)(
		'submits the description with Enter while Shift+Enter preserves a newline ($label)',
		async ({ CreateIssue }) => {
			const user = userEvent.setup();
			renderForm(<CreateIssue />);
			await user.click(screen.getByRole('button', { name: 'Create Issue' }));
			await user.type(screen.getByRole('textbox', { name: /issue name/i }), ' a ');
			await user.type(screen.getByRole('textbox', { name: 'Description' }), ' First line ');
			await user.keyboard('{Shift>}{Enter}{/Shift}');
			await user.keyboard(' Second line ');
			expect(savedIssues).toHaveLength(0);
			expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue(
				' First line \n Second line ',
			);
			await user.keyboard('{Enter}');
			await waitFor(() => expect(savedIssues).toHaveLength(1));
			expect(savedIssues[0]).toMatchObject({
				name: ' a ',
				description: ' First line \n Second line ',
			});
			await waitFor(() =>
				expect(
					screen.queryByRole('textbox', { name: /issue name/i }),
				).not.toBeInTheDocument(),
			);
			await user.click(screen.getByRole('button', { name: 'Create Issue' }));
			expect(screen.getByRole('textbox', { name: /issue name/i })).toHaveValue('');
			expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue('');
		},
	);

	it.each(['Unassigned', 'Decision', 'Uncertainty', 'Fact', 'Utility'] as const)(
		'creates %s with In boundary and empty decision/uncertainty defaults',
		async type => {
			const user = userEvent.setup();
			renderForm(<CreateIssueButton />);
			await user.click(screen.getByRole('button', { name: 'Create Issue' }));
			await user.type(screen.getByRole('textbox', { name: /issue name/i }), 'A new issue');
			await user.type(screen.getByRole('textbox', { name: 'Description' }), 'A description');
			await user.click(screen.getByRole('radio', { name: type }));
			await user.click(screen.getByRole('button', { name: 'Add Issue' }));

			await waitFor(() => expect(savedIssues).toHaveLength(1));
			expect(savedIssues[0]).toMatchObject({
				name: 'A new issue',
				description: 'A description',
				type,
				boundary: 'in',
				decision: { type: 'Policy', options: [] },
				uncertainty: { is_key: false, outcomes: [] },
			});
			expect(savedRequests).toEqual([{ method: 'post', url: '/issues' }]);
			await waitFor(() =>
				expect(screen.queryByRole('button', { name: 'Add Issue' })).not.toBeInTheDocument(),
			);
		},
	);

	it('offers labelled issue type and boundary segments with keyboard selection and focus', async () => {
		const user = userEvent.setup();
		renderForm(<CreateIssueButton />);
		await user.click(screen.getByRole('button', { name: 'Create Issue' }));
		const types = within(screen.getByRole('radiogroup', { name: 'Issue type' }));
		expect(types.getAllByRole('radio').map(radio => radio.getAttribute('value'))).toEqual([
			'Unassigned',
			'Decision',
			'Uncertainty',
			'Fact',
			'Utility',
		]);
		await user.click(types.getByRole('radio', { name: 'Unassigned' }));
		await user.keyboard('{ArrowRight}');
		expect(types.getByRole('radio', { name: 'Decision' })).toBeChecked();
		expect(types.getByRole('radio', { name: 'Decision' })).toHaveFocus();
		await user.keyboard('{End}');
		expect(types.getByRole('radio', { name: 'Utility' })).toBeChecked();
		await user.keyboard('{ArrowRight}');
		expect(types.getByRole('radio', { name: 'Unassigned' })).toBeChecked();

		const boundary = within(screen.getByRole('radiogroup', { name: 'Boundary' }));
		expect(boundary.getByRole('radio', { name: 'In' })).toBeChecked();
		await user.click(boundary.getByRole('radio', { name: 'In' }));
		await user.keyboard('{ArrowRight}');
		expect(boundary.getByRole('radio', { name: 'On' })).toBeChecked();
		await user.keyboard('{ArrowDown}');
		expect(boundary.getByRole('radio', { name: 'Out' })).toBeChecked();
		await user.keyboard('{Home}');
		expect(boundary.getByRole('radio', { name: 'In' })).toBeChecked();
	});

	it('creates a Decision using Policy/Focus/Tactical segments and optional empty utility', async () => {
		const user = userEvent.setup();
		renderForm(<CreateIssueButton />);
		await user.click(screen.getByRole('button', { name: 'Create Issue' }));
		await user.type(screen.getByRole('textbox', { name: /issue name/i }), 'Decision');
		await user.type(screen.getByRole('textbox', { name: 'Description' }), 'Choose a direction');
		await user.click(screen.getByRole('radio', { name: 'Decision' }));
		const decisionType = within(screen.getByRole('radiogroup', { name: 'Decision type' }));
		expect(decisionType.getByRole('radio', { name: 'Policy' })).toBeChecked();
		await user.click(decisionType.getByRole('radio', { name: 'Policy' }));
		await user.keyboard('{ArrowRight}');
		expect(decisionType.getByRole('radio', { name: 'Focus' })).toBeChecked();
		expect(decisionType.getByRole('radio', { name: 'Focus' })).toHaveFocus();
		await user.click(screen.getByRole('button', { name: 'Add Option' }));
		await user.click(screen.getByRole('button', { name: 'Add Option' }));
		await user.click(screen.getByRole('button', { name: 'Remove Option 2' }));
		await user.click(screen.getByRole('button', { name: 'Add Issue' }));
		expect(await screen.findByText('Option name is required')).toBeInTheDocument();
		expect(savedIssues).toHaveLength(0);
		await user.type(screen.getByRole('textbox', { name: 'Option 1' }), '  a  ');
		await user.clear(screen.getByRole('spinbutton', { name: 'Utility' }));
		await user.click(screen.getByRole('button', { name: 'Add Issue' }));

		await waitFor(() => expect(savedIssues).toHaveLength(1));
		expect(savedIssues[0]).toMatchObject({
			type: 'Decision',
			boundary: 'in',
			decision: { type: 'Focus', options: [{ name: '  a  ', utility: 0 }] },
		});
	});

	it('creates a key Uncertainty, rejects a blank outcome and can remove a draft outcome', async () => {
		const user = userEvent.setup();
		renderForm(<CreateIssueButton />);
		await user.click(screen.getByRole('button', { name: 'Create Issue' }));
		await user.type(screen.getByRole('textbox', { name: /issue name/i }), 'Uncertainty');
		await user.type(screen.getByRole('textbox', { name: 'Description' }), 'Possible results');
		await user.click(screen.getByRole('radio', { name: 'Uncertainty' }));
		const isKey = screen.getByRole('switch', { name: 'Is Key' });
		expect(isKey).not.toBeChecked();
		isKey.focus();
		await user.keyboard(' ');
		expect(isKey).toBeChecked();
		await user.click(screen.getByRole('button', { name: 'Add Outcome' }));
		await user.click(screen.getByRole('button', { name: 'Add Outcome' }));
		await user.click(screen.getByRole('button', { name: 'Remove Outcome 2' }));
		await user.type(screen.getByRole('textbox', { name: 'Outcome 1 Name' }), ' \t ');
		await user.click(screen.getByRole('button', { name: 'Add Issue' }));
		expect(await screen.findByText('Outcome name is required')).toBeInTheDocument();
		expect(savedIssues).toHaveLength(0);
		await user.clear(screen.getByRole('textbox', { name: 'Outcome 1 Name' }));
		await user.type(screen.getByRole('textbox', { name: 'Outcome 1 Name' }), 'A result');
		await user.clear(screen.getByRole('spinbutton', { name: 'Utility' }));
		await user.click(screen.getByRole('button', { name: 'Add Issue' }));
		await waitFor(() => expect(savedIssues).toHaveLength(1));
		expect(savedIssues[0]).toMatchObject({
			type: 'Uncertainty',
			uncertainty: { is_key: true, outcomes: [{ name: 'A result', utility: 0 }] },
		});
	});
});
