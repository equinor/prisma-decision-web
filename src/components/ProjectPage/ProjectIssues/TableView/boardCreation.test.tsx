import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { Toaster, toast } from 'sonner';
import { ReactNode } from 'react';
import { apiClient } from '../../../../api';
import { existingIssue, project } from '../../../../test/issueFixtures';
import { Issue, Project, issueSchema } from '../../../../validators';
import { ProjectContext } from '../../ProjectContext';
import { TableView } from './TableView';
import { ListView } from '../ListView/ListView';

vi.hoisted(() => {
	vi.stubGlobal(
		'ResizeObserver',
		class {
			observe() {}
			unobserve() {}
			disconnect() {}
		},
	);
});

vi.mock('../../../../api', () => ({
	apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

let savedIssues: Issue[];

beforeEach(() => {
	savedIssues = [];
	vi.mocked(apiClient.get).mockImplementation(async () => ({
		data: structuredClone(savedIssues),
	}));
	vi.mocked(apiClient.post).mockImplementation(async (_url, body) => {
		const created = issueSchema.array().parse(body);
		savedIssues.push(...created);
		return { data: created };
	});
	vi.mocked(apiClient.put).mockImplementation(async (_url, body) => {
		const updated = issueSchema.array().parse(body);
		savedIssues = savedIssues.map(issue => updated.find(next => next.id === issue.id) ?? issue);
		return { data: updated };
	});
});

afterEach(() => {
	toast.dismiss();
	vi.clearAllMocks();
	vi.useRealTimers();
});

const renderBoard = () => {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	const contents = (view: ReactNode, selectedProject = project) => (
		<QueryClientProvider client={queryClient}>
			<ProjectContext value={selectedProject}>{view}</ProjectContext>
			<Toaster />
		</QueryClientProvider>
	);
	const view = render(contents(<TableView />));
	return {
		...view,
		queryClient,
		user: userEvent.setup(),
		showView: (next: ReactNode) => view.rerender(contents(next)),
		showProject: (next: Project) => view.rerender(contents(<TableView />, next)),
	};
};

test('leaving for another project discards the composer instead of carrying its old project draft', async () => {
	const { user, showProject } = renderBoard();
	await user.click(screen.getByRole('button', { name: 'Add issue at top of Decision' }));
	await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Old project draft');
	showProject({
		...project,
		id: '00000000-0000-4000-8000-000000000099',
		name: 'Another project',
	});
	expect(screen.queryByRole('form')).not.toBeInTheDocument();
	await user.click(screen.getByRole('button', { name: 'Add issue at top of Decision' }));
	expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('');
	showProject(project);
	expect(screen.queryByRole('form')).not.toBeInTheDocument();
	expect(apiClient.post).not.toHaveBeenCalled();
});

test('every Board column has top and bottom Add controls and only one focused composer can open', async () => {
	const { user } = renderBoard();
	await waitFor(() => expect(apiClient.get).toHaveBeenCalled());
	for (const type of ['Unassigned', 'Decision', 'Uncertainty', 'Fact']) {
		const column = screen.getByRole('region', { name: `${type} issues` });
		expect(
			within(column).getByRole('button', { name: `Add issue at top of ${type}` }),
		).toBeEnabled();
		expect(
			within(column).getByRole('button', { name: `Add issue at bottom of ${type}` }),
		).toBeEnabled();
	}
	expect(screen.queryByRole('region', { name: 'Utility issues' })).not.toBeInTheDocument();
	await user.click(screen.getByRole('button', { name: 'Add issue at top of Decision' }));
	const composer = screen.getByRole('form', { name: 'NEW DECISION' });
	expect(within(composer).getByRole('textbox', { name: 'Name' })).toHaveFocus();
	expect(within(composer).getByRole('textbox', { name: 'Description' })).toHaveAttribute(
		'required',
	);
	expect(within(composer).getByRole('radio', { name: 'In' })).toBeChecked();
	expect(within(composer).getByRole('radiogroup', { name: 'Boundary' })).toBeInTheDocument();
	expect(within(composer).getByRole('button', { name: 'Add' })).toBeDisabled();
	const alternatives = screen.getAllByRole('button', { name: /^Add issue at/ });
	expect(alternatives).toHaveLength(7);
	for (const alternative of alternatives) expect(alternative).toBeDisabled();
	await user.click(alternatives[0]);
	expect(screen.getAllByRole('form')).toHaveLength(1);
});

test('bottom creation submits with Enter, preserves multiline text and column defaults, and remains last after reload', async () => {
	savedIssues = [{ ...existingIssue(), name: 'Existing decision', order: 3 }];
	const { user, queryClient, unmount } = renderBoard();
	await screen.findByText('Existing decision');
	await user.click(screen.getByRole('button', { name: 'Add issue at bottom of Decision' }));
	const composer = screen.getByRole('form', { name: 'NEW DECISION' });
	await user.type(within(composer).getByRole('textbox', { name: 'Name' }), 'New decision');
	await user.type(
		within(composer).getByRole('textbox', { name: 'Description' }),
		'First line{Enter}Second line',
	);
	expect(within(composer).getByRole('textbox', { name: 'Description' })).toHaveValue(
		'First line\nSecond line',
	);
	expect(apiClient.post).not.toHaveBeenCalled();
	await user.click(within(composer).getByRole('textbox', { name: 'Name' }));
	await user.keyboard('{Enter}');
	await screen.findByText('New decision');
	expect(screen.queryByRole('form')).not.toBeInTheDocument();
	const created = savedIssues.find(issue => issue.name === 'New decision');
	expect(created).toMatchObject({
		project_id: project.id,
		type: 'Decision',
		boundary: 'in',
		description: 'First line\nSecond line',
		order: 4,
		decision: { type: 'Policy', options: [] },
		uncertainty: { is_key: false, outcomes: [] },
	});
	const column = screen.getByRole('region', { name: 'Decision issues' });
	expect(
		within(column)
			.getByText('Existing decision')
			.compareDocumentPosition(within(column).getByText('New decision')) &
			Node.DOCUMENT_POSITION_FOLLOWING,
	).toBeTruthy();
	await queryClient.refetchQueries({ queryKey: ['issues'] });
	unmount();
	renderBoard();
	await screen.findByText('New decision');
	const reloaded = screen.getByRole('region', { name: 'Decision issues' });
	expect(
		within(reloaded)
			.getByText('Existing decision')
			.compareDocumentPosition(within(reloaded).getByText('New decision')) &
			Node.DOCUMENT_POSITION_FOLLOWING,
	).toBeTruthy();
});

test('whitespace-only fields keep Add disabled until both fields are valid', async () => {
	const { user } = renderBoard();
	await user.click(screen.getByRole('button', { name: 'Add issue at top of Fact' }));
	const composer = screen.getByRole('form', { name: 'NEW FACT' });
	const name = within(composer).getByRole('textbox', { name: 'Name' });
	const description = within(composer).getByRole('textbox', { name: 'Description' });
	await user.type(name, '   ');
	await user.type(description, '   ');
	expect(within(composer).getByRole('button', { name: 'Add' })).toBeDisabled();
	await user.click(name);
	await user.keyboard('{Enter}');
	expect(apiClient.post).not.toHaveBeenCalled();
	await user.type(name, 'Licence period');
	expect(within(composer).getByRole('button', { name: 'Add' })).toBeDisabled();
	await user.type(description, 'The licence expires in 2032.');
	expect(within(composer).getByRole('button', { name: 'Add' })).toBeEnabled();
	await user.click(within(composer).getByRole('radio', { name: 'Out' }));
	await user.click(within(composer).getByRole('button', { name: 'Add' }));
	await screen.findByText('Licence period');
	expect(savedIssues).toEqual([
		expect.objectContaining({ name: '   Licence period', boundary: 'out', type: 'Fact' }),
	]);
});

test.each([
	[0, 0, 7],
	[2, 6, 9],
])(
	'top creation persists before existing orders %j without losing issue data',
	async (first, second, third) => {
		const orders = [first, second, third];
		const original = orders.map((order, index) => ({
			...existingIssue(),
			id: `00000000-0000-4000-8000-00000000000${index + 2}`,
			name: `Existing ${index + 1}`,
			order,
		}));
		const otherColumn = {
			...existingIssue(),
			id: '00000000-0000-4000-8000-000000000009',
			type: 'Fact' as const,
			name: 'Existing fact',
			order: 0,
		};
		savedIssues = [...original, otherColumn];
		const { user, queryClient, unmount } = renderBoard();
		await screen.findByText('Existing 1');
		await user.click(screen.getByRole('button', { name: 'Add issue at top of Decision' }));
		const composer = screen.getByRole('form', { name: 'NEW DECISION' });
		await user.type(within(composer).getByRole('textbox', { name: 'Name' }), 'First decision');
		await user.type(
			within(composer).getByRole('textbox', { name: 'Description' }),
			'Create at the top',
		);
		await user.click(within(composer).getByRole('button', { name: 'Add' }));
		await screen.findByText('First decision');
		const column = screen.getByRole('region', { name: 'Decision issues' });
		expect(
			within(column)
				.getByText('First decision')
				.compareDocumentPosition(within(column).getByText('Existing 1')) &
				Node.DOCUMENT_POSITION_FOLLOWING,
		).toBeTruthy();
		expect(savedIssues.find(issue => issue.name === 'First decision')?.order).toBe(0);
		expect(savedIssues.find(issue => issue.id === otherColumn.id)).toEqual(otherColumn);
		for (const [index, originalIssue] of original.entries()) {
			expect(savedIssues.find(issue => issue.id === originalIssue.id)).toEqual({
				...originalIssue,
				order: orders[0] === 0 ? index + 1 : originalIssue.order,
			});
		}
		await queryClient.refetchQueries({ queryKey: ['issues'] });
		unmount();
		renderBoard();
		await screen.findByText('First decision');
		const reloaded = screen.getByRole('region', { name: 'Decision issues' });
		expect(
			within(reloaded)
				.getByText('First decision')
				.compareDocumentPosition(within(reloaded).getByText('Existing 1')) &
				Node.DOCUMENT_POSITION_FOLLOWING,
		).toBeTruthy();
	},
);

test('outside clicks close only empty composers, while Escape and Close always discard the draft', async () => {
	const { user } = renderBoard();
	const open = async () => {
		await user.click(screen.getByRole('button', { name: 'Add issue at top of Uncertainty' }));
		return screen.getByRole('form', { name: 'NEW UNCERTAINTY' });
	};
	await open();
	await user.click(screen.getByRole('heading', { name: 'Fact' }));
	expect(screen.queryByRole('form')).not.toBeInTheDocument();
	let composer = await open();
	await user.type(within(composer).getByRole('textbox', { name: 'Name' }), 'Oil price');
	await user.click(screen.getByRole('heading', { name: 'Fact' }));
	expect(composer).toBeInTheDocument();
	await user.keyboard('{Escape}');
	expect(screen.queryByRole('form')).not.toBeInTheDocument();
	composer = await open();
	expect(within(composer).getByRole('textbox', { name: 'Name' })).toHaveValue('');
	await user.type(
		within(composer).getByRole('textbox', { name: 'Description' }),
		'Nonempty description',
	);
	await user.click(screen.getByRole('heading', { name: 'Fact' }));
	expect(composer).toBeInTheDocument();
	await user.click(within(composer).getByRole('button', { name: 'Close new issue' }));
	composer = await open();
	expect(within(composer).getByRole('textbox', { name: 'Description' })).toHaveValue('');
	await user.click(within(composer).getByRole('radio', { name: 'On' }));
	await user.click(screen.getByRole('heading', { name: 'Fact' }));
	expect(composer).toBeInTheDocument();
	await user.click(within(composer).getByRole('radio', { name: 'In' }));
	await user.type(within(composer).getByRole('textbox', { name: 'Name' }), 'Temporary draft');
	await user.clear(within(composer).getByRole('textbox', { name: 'Name' }));
	await user.click(screen.getByRole('heading', { name: 'Fact' }));
	expect(screen.queryByRole('form')).not.toBeInTheDocument();
	expect(apiClient.post).not.toHaveBeenCalled();
});

test('pending creation cannot submit twice and a failure retains the entire draft for retry', async () => {
	let reject!: (reason: Error) => void;
	vi.mocked(apiClient.post).mockImplementationOnce(
		() =>
			new Promise((_resolve, rejectRequest) => {
				reject = rejectRequest;
			}),
	);
	const { user } = renderBoard();
	await user.click(screen.getByRole('button', { name: 'Add issue at bottom of Uncertainty' }));
	const composer = screen.getByRole('form', { name: 'NEW UNCERTAINTY' });
	await user.type(within(composer).getByRole('textbox', { name: 'Name' }), 'Oil price');
	await user.type(
		within(composer).getByRole('textbox', { name: 'Description' }),
		'Price in 2030',
	);
	await user.click(within(composer).getByRole('radio', { name: 'On' }));
	await user.dblClick(within(composer).getByRole('button', { name: 'Add' }));
	expect(apiClient.post).toHaveBeenCalledTimes(1);
	expect(within(composer).getByRole('button', { name: 'Add' })).toBeDisabled();
	expect(within(composer).getByRole('textbox', { name: 'Name' })).toBeDisabled();
	expect(within(composer).getByRole('radio', { name: 'Out' })).toBeDisabled();
	await act(async () => reject(new Error('Network unavailable')));
	expect(await screen.findByText('Failed to create issue')).toBeInTheDocument();
	expect(screen.getByRole('form')).toBe(composer);
	expect(within(composer).getByRole('textbox', { name: 'Name' })).toHaveValue('Oil price');
	expect(within(composer).getByRole('textbox', { name: 'Description' })).toHaveValue(
		'Price in 2030',
	);
	expect(within(composer).getByRole('radio', { name: 'On' })).toBeChecked();
	expect(screen.queryByRole('status')).not.toBeInTheDocument();
	await user.click(within(composer).getByRole('button', { name: 'Add' }));
	await screen.findByText('Oil price');
	expect(savedIssues).toEqual([
		expect.objectContaining({
			type: 'Uncertainty',
			boundary: 'on',
			uncertainty: expect.objectContaining({ is_key: false, outcomes: [] }),
		}),
	]);
	expect(apiClient.post).toHaveBeenCalledTimes(2);
	expect(vi.mocked(apiClient.post).mock.calls[1][1]).toEqual(
		vi.mocked(apiClient.post).mock.calls[0][1],
	);
});

test('a successful new card is highlighted for exactly two seconds', async () => {
	const { user } = renderBoard();
	await user.click(screen.getByRole('button', { name: 'Add issue at top of Unassigned' }));
	const composer = screen.getByRole('form', { name: 'NEW UNASSIGNED' });
	await user.type(within(composer).getByRole('textbox', { name: 'Name' }), 'Rig availability');
	await user.type(
		within(composer).getByRole('textbox', { name: 'Description' }),
		'Availability in the summer',
	);
	vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
	fireEvent.click(within(composer).getByRole('button', { name: 'Add' }));
	await act(async () => vi.advanceTimersByTimeAsync(0));
	expect(screen.queryByRole('form')).not.toBeInTheDocument();
	expect(screen.getByRole('status', { name: 'Issue created' })).toHaveTextContent(
		'Issue created: Rig availability',
	);
	const card = screen.getByText('Rig availability').closest('.shadow-tile');
	expect(card).toHaveClass('ring-2');
	await act(async () => vi.advanceTimersByTimeAsync(1999));
	expect(screen.getByRole('status', { name: 'Issue created' })).toBeInTheDocument();
	expect(card).toHaveClass('ring-2');
	await act(async () => vi.advanceTimersByTimeAsync(1));
	expect(screen.queryByRole('status', { name: 'Issue created' })).not.toBeInTheDocument();
	expect(card).not.toHaveClass('ring-2');
	expect(screen.getByRole('button', { name: 'Add issue at top of Unassigned' })).toBeEnabled();
});

test('boundary selector keyboard navigation can move to Add and submit with Enter', async () => {
	const { user } = renderBoard();
	await user.click(screen.getByRole('button', { name: 'Add issue at top of Fact' }));
	const composer = screen.getByRole('form', { name: 'NEW FACT' });
	await user.type(within(composer).getByRole('textbox', { name: 'Name' }), 'Water depth');
	await user.type(
		within(composer).getByRole('textbox', { name: 'Description' }),
		'The depth is known',
	);
	await user.tab();
	expect(within(composer).getByRole('radio', { name: 'In' })).toHaveFocus();
	await user.keyboard('{ArrowRight}');
	expect(within(composer).getByRole('radio', { name: 'On' })).toHaveFocus();
	expect(within(composer).getByRole('radio', { name: 'On' })).toBeChecked();
	await user.tab();
	expect(within(composer).getByRole('button', { name: 'Add' })).toHaveFocus();
	await user.keyboard('{Enter}');
	await screen.findByText('Water depth');
	expect(savedIssues[0]).toMatchObject({ type: 'Fact', boundary: 'on' });
});

test('switching to List and leaving the page discard unsaved Board drafts without confirmation', async () => {
	const confirm = vi.spyOn(window, 'confirm');
	const { user, showView, unmount } = renderBoard();
	const fillDraft = async () => {
		await user.click(screen.getByRole('button', { name: 'Add issue at top of Decision' }));
		await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Unsaved decision');
		await user.type(
			screen.getByRole('textbox', { name: 'Description' }),
			'Unsaved description',
		);
	};
	await fillDraft();
	showView(<ListView />);
	expect(screen.queryByRole('form', { name: 'NEW DECISION' })).not.toBeInTheDocument();
	showView(<TableView />);
	await user.click(screen.getByRole('button', { name: 'Add issue at top of Decision' }));
	expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('');
	expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue('');
	await user.click(screen.getByRole('button', { name: 'Close new issue' }));
	await fillDraft();
	unmount();
	const reloaded = renderBoard();
	await reloaded.user.click(screen.getByRole('button', { name: 'Add issue at top of Decision' }));
	expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('');
	expect(apiClient.post).not.toHaveBeenCalled();
	expect(confirm).not.toHaveBeenCalled();
	confirm.mockRestore();
});

test.each(['reorder', 'create'])(
	'a top %s failure preserves the draft and relative column order for retry',
	async stage => {
		savedIssues = [{ ...existingIssue(), order: 0, name: 'Existing decision' }];
		if (stage === 'reorder')
			vi.mocked(apiClient.put).mockRejectedValueOnce(new Error('Reorder failed'));
		else vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Create failed'));
		const { user } = renderBoard();
		await screen.findByText('Existing decision');
		await user.click(screen.getByRole('button', { name: 'Add issue at top of Decision' }));
		const composer = screen.getByRole('form', { name: 'NEW DECISION' });
		await user.type(
			within(composer).getByRole('textbox', { name: 'Name' }),
			'New first decision',
		);
		await user.type(
			within(composer).getByRole('textbox', { name: 'Description' }),
			'Keep this draft',
		);
		await user.click(within(composer).getByRole('button', { name: 'Add' }));
		expect(await screen.findByText('Failed to create issue')).toBeInTheDocument();
		expect(within(composer).getByRole('textbox', { name: 'Name' })).toHaveValue(
			'New first decision',
		);
		expect(screen.queryByRole('status', { name: 'Issue created' })).not.toBeInTheDocument();
		expect(savedIssues).toHaveLength(1);
		await user.click(within(composer).getByRole('button', { name: 'Add' }));
		await screen.findByText('New first decision');
		expect(savedIssues).toHaveLength(2);
		const column = screen.getByRole('region', { name: 'Decision issues' });
		expect(
			within(column)
				.getByText('New first decision')
				.compareDocumentPosition(within(column).getByText('Existing decision')) &
				Node.DOCUMENT_POSITION_FOLLOWING,
		).toBeTruthy();
	},
);
