import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosAdapter } from 'axios';
import { ReactNode, useState } from 'react';
import { Toaster, toast } from 'sonner';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '../../api';
import { existingIssue, project } from '../../test/issueFixtures';
import { Issue } from '../../validators';
import { ProjectContext } from '../ProjectPage/ProjectContext';
import { CreateIssueButton } from './CreateIssueButton';
import { CreateIssueToolbarButton } from './CreateIssueToolbarButton';
import { EditIssueModal } from './EditIssueModal';

const createIssueButtons = [
	{ label: 'regular button', CreateIssue: CreateIssueButton },
	{ label: 'toolbar button', CreateIssue: CreateIssueToolbarButton },
];

let savedIssues: Issue[];
let savedRequests: { method: string; url: string | undefined }[];

const adapter: AxiosAdapter = async config => {
	if (config.method === 'post' || config.method === 'put') {
		savedIssues.push(...JSON.parse(config.data));
		savedRequests.push({ method: config.method, url: config.url });
	}
	return {
		config,
		status: 200,
		statusText: 'OK',
		headers: {},
		data: savedIssues,
	};
};

const renderForm = (children: ReactNode) => {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	queryClient.setQueryData(['issues'], []);
	return render(
		<QueryClientProvider client={queryClient}>
			<ProjectContext value={project}>{children}</ProjectContext>
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
	it.each(['Cancel', 'Close'])('discards unsaved Edit changes with %s', async closeLabel => {
		const user = userEvent.setup();
		const issue = existingIssue();
		const ControlledEdit = () => {
			const [open, setOpen] = useState(true);
			return (
				<>
					<button onClick={() => setOpen(true)}>Open Edit</button>
					<EditIssueModal issue={issue} open={open} onClose={setOpen} />
				</>
			);
		};
		renderForm(<ControlledEdit />);
		await user.clear(screen.getByRole('textbox', { name: /issue name/i }));
		await user.type(screen.getByRole('textbox', { name: /issue name/i }), 'Unsaved name');
		await user.click(screen.getByRole('radio', { name: 'Fact' }));
		await user.click(screen.getByRole('button', { name: closeLabel }));
		expect(screen.queryByRole('dialog', { name: 'Edit Issue' })).not.toBeInTheDocument();
		await user.click(screen.getByRole('button', { name: 'Open Edit' }));
		expect(screen.getByRole('textbox', { name: /issue name/i })).toHaveValue(
			' Existing issue ',
		);
		expect(screen.getByRole('radio', { name: 'Decision' })).toBeChecked();
		expect(screen.getByRole('radio', { name: 'Tactical' })).toBeChecked();
		expect(savedIssues).toHaveLength(0);
	});

	it.each(['Unassigned', 'Decision', 'Uncertainty', 'Fact', 'Utility'] as const)(
		'edits %s through the whole-issue API while preserving unedited values',
		async type => {
			const user = userEvent.setup();
			const issue = { ...existingIssue(), type };
			const onClose = vi.fn();
			renderForm(<EditIssueModal issue={issue} open onClose={onClose} />);
			expect(screen.getByRole('radio', { name: 'Out' })).toBeChecked();
			await user.click(screen.getByRole('radio', { name: 'On' }));
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
			expect(onClose).toHaveBeenCalledWith(false);
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
					<EditIssueModal issue={issue} open onClose={vi.fn()} />
				),
			);
			if (mode === 'Create') {
				await user.click(screen.getByRole('button', { name: 'Create Issue' }));
			}
			await user.click(
				screen.getByRole('button', {
					name: mode === 'Create' ? 'Add Issue' : 'Update Issue',
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
			const submitLabel = mode === 'Create' ? 'Add Issue' : 'Update Issue';
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
						<EditIssueModal issue={issue} open onClose={onClose} />
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
					<EditIssueModal issue={existingIssue()} open onClose={onClose} />
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
			const submitLabel = mode === 'Create' ? 'Add Issue' : 'Update Issue';
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
				await waitFor(() => expect(onClose).toHaveBeenCalledWith(false));
			}
			expect(attempts).toBe(1);
			expect(savedIssues).toHaveLength(1);
		},
	);

	it('labels Edit as a dialog and preserves all nested data while changing issue type', async () => {
		const user = userEvent.setup();
		const issue = existingIssue();
		const onClose = vi.fn();
		renderForm(<EditIssueModal issue={issue} open onClose={onClose} />);
		const editor = within(screen.getByRole('dialog', { name: 'Edit Issue' }));
		expect(editor.getByRole('textbox', { name: /issue name/i })).toHaveValue(
			' Existing issue ',
		);
		expect(editor.getByRole('radio', { name: 'Out' })).toBeChecked();
		expect(editor.getByRole('radio', { name: 'Tactical' })).toBeChecked();
		await user.click(editor.getByRole('radio', { name: 'Uncertainty' }));
		expect(editor.getByRole('switch', { name: 'Is Key' })).toBeChecked();
		expect(editor.getByRole('textbox', { name: 'Outcome 1 Name' })).toHaveValue(
			'Existing outcome',
		);
		await user.click(editor.getByRole('radio', { name: 'Fact' }));
		await user.click(editor.getByRole('radio', { name: 'Decision' }));
		expect(editor.getByRole('radio', { name: 'Tactical' })).toBeChecked();
		expect(editor.getByRole('textbox', { name: 'Option 1' })).toHaveValue('Existing option');
		await user.click(editor.getByRole('radio', { name: 'Utility' }));
		await user.click(editor.getByRole('button', { name: 'Update Issue' }));
		await waitFor(() => expect(savedIssues).toHaveLength(1));
		expect(savedIssues[0]).toEqual({ ...issue, type: 'Utility' });
		expect(onClose).toHaveBeenCalledWith(false);
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
