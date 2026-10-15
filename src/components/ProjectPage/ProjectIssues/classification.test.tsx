import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { Toaster, toast } from 'sonner';
import { useState } from 'react';
import { apiClient } from '../../../api';
import { Issue, issueSchema, Option, Outcome, Project } from '../../../validators';
import { ProjectContext } from '../ProjectContext';
import { ListView } from './ListView/ListView';
import { TableView } from './TableView/TableView';
import {
	IssueCard,
	IssueCardContent,
	IssueCardHeader,
	IssueCardStates,
} from '../../common/Cards/IssueCard';

vi.hoisted(() => {
	if (!globalThis.ResizeObserver) {
		vi.stubGlobal(
			'ResizeObserver',
			class {
				observe() {}
				unobserve() {}
				disconnect() {}
			},
		);
	}
	if (!globalThis.PointerEvent) {
		vi.stubGlobal('PointerEvent', class extends MouseEvent {});
	}
});

vi.mock('../../../api', () => ({
	apiClient: { get: vi.fn(), put: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

const projectId = '00000000-0000-4000-8000-000000000001';
const project: Project = {
	id: projectId,
	name: 'Classification project',
	public: false,
	favorite: false,
	parent_project_id: null,
	end_date: '2026-10-12T00:00:00Z',
	users: [],
};

const makeIssue = (overrides: Partial<Issue> = {}): Issue => {
	const id = overrides.id ?? '00000000-0000-4000-8000-000000000002';
	return {
		id,
		project_id: projectId,
		name: 'Drill well',
		description: 'Should we drill?',
		order: 1,
		type: 'Decision',
		boundary: 'in',
		decision: {
			id,
			issue_id: id,
			project_id: projectId,
			type: 'Focus',
			options: [
				{
					id,
					decision_id: id,
					project_id: projectId,
					name: 'Drill now',
					utility: 1,
				},
			],
		},
		uncertainty: {
			id,
			issue_id: id,
			project_id: projectId,
			is_key: false,
			outcomes: [{ id, uncertainty_id: id, project_id: projectId, name: 'High', utility: 2 }],
		},
		utility: { id, issue_id: id, project_id: projectId },
		value_metric: { id, issue_id: id, name: 'NPV' },
		node: {
			id,
			issue_id: id,
			project_id: projectId,
			name: 'default',
			node_style: { id, node_id: id, x_position: 20, y_position: 40 },
		},
		...overrides,
	};
};

let savedIssues: Issue[];

beforeEach(() => {
	savedIssues = [makeIssue()];
	vi.mocked(apiClient.get).mockImplementation(async () => ({
		data: structuredClone(savedIssues),
	}));
	vi.mocked(apiClient.put).mockImplementation(async (_url, data) => {
		const issues = issueSchema.array().parse(data);
		savedIssues = savedIssues.map(
			issue => issues.find(updated => updated.id === issue.id) ?? issue,
		);
		return { data: issues };
	});
});

afterEach(() => {
	cleanup();
	toast.dismiss();
	vi.clearAllMocks();
});

const renderIssues = (
	view = <ListView />,
	queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false, staleTime: 1000 * 60 * 5 },
			mutations: { retry: false },
		},
	}),
) => {
	render(
		<QueryClientProvider client={queryClient}>
			<ProjectContext value={project}>{view}</ProjectContext>
			<Toaster />
		</QueryClientProvider>,
	);
	return userEvent.setup();
};

test('List issue type menu checks the saved value and dismisses without saving', async () => {
	const user = renderIssues();
	await user.click(await screen.findByRole('button', { name: 'Issue type: Decision' }));
	const menu = screen.getByRole('menu', { name: 'ISSUE TYPE' });
	expect(
		within(menu)
			.getAllByRole('menuitem')
			.map(item => item.textContent),
	).toEqual(['Unassigned', 'Decision', 'Uncertainty', 'Fact', 'Utility']);
	expect(within(menu).getByRole('menuitem', { name: 'Decision' })).toHaveAttribute(
		'aria-current',
		'true',
	);
	await user.keyboard('{Escape}');
	expect(screen.queryByRole('menu')).not.toBeInTheDocument();
	expect(apiClient.put).not.toHaveBeenCalled();
});

test('List keeps state counts and full Edit uses its existing non-optimistic save behavior', async () => {
	let finish!: () => void;
	vi.mocked(apiClient.put).mockImplementation(
		async (_url, data) =>
			new Promise(resolve => {
				finish = () => {
					savedIssues = issueSchema.array().parse(data);
					resolve({ data: savedIssues });
				};
			}),
	);
	const user = renderIssues();
	await user.click(await screen.findByRole('button', { name: 'Edit issue: Drill well' }));
	expect(screen.getByRole('cell', { name: '1' })).toBeInTheDocument();
	const name = within(screen.getByRole('dialog', { name: 'Edit Issue' })).getByRole('textbox', {
		name: 'Issue name',
	});
	await user.clear(name);
	await user.type(name, 'Renamed issue');
	await user.click(screen.getByRole('button', { name: 'Update Issue' }));
	await waitFor(() => expect(apiClient.put).toHaveBeenCalledTimes(1));
	expect(screen.getByText('Drill well')).toBeInTheDocument();
	expect(screen.queryByText('Renamed issue')).not.toBeInTheDocument();
	await act(async () => finish());
	expect(await screen.findByText('Renamed issue')).toBeInTheDocument();
});

test('List decision type saves immediately and moves the intact issue out of the diagram group', async () => {
	const original = makeIssue();
	const user = renderIssues();
	await user.click(await screen.findByRole('button', { name: 'Decision type: Focus' }));
	const menu = screen.getByRole('menu', { name: 'DECISION TYPE' });
	expect(
		within(menu)
			.getAllByRole('menuitem')
			.map(item => item.textContent),
	).toEqual(['Policy', 'Focus', 'Tactical']);
	expect(within(menu).getByRole('menuitem', { name: 'Focus' })).toHaveAttribute(
		'aria-current',
		'true',
	);
	await user.click(within(menu).getByRole('menuitem', { name: 'Policy' }));
	expect(screen.queryByRole('menu', { name: 'DECISION TYPE' })).not.toBeInTheDocument();
	await waitFor(() => {
		expect(
			within(screen.getByRole('table', { name: 'Issues filtered out' })).getByText(
				'Drill well',
			),
		).toBeInTheDocument();
	});

	expect(savedIssues).toEqual([
		{ ...original, decision: { ...original.decision, type: 'Policy' } },
	]);
	expect(screen.queryByText('Date Added')).not.toBeInTheDocument();
	expect(screen.queryByText('Date Updated')).not.toBeInTheDocument();
	expect(screen.getByRole('columnheader', { name: 'Decision type / Key' })).toBeInTheDocument();
});

test.each(['List', 'Board'])(
	'%s key toggle stays enabled and queues subsequent changes while saving',
	async view => {
		const original = makeIssue({ type: 'Uncertainty' });
		savedIssues = [original];
		const finishes: (() => void)[] = [];
		vi.mocked(apiClient.put).mockImplementation(
			(_url, data) =>
				new Promise(resolve => {
					finishes.push(() => {
						savedIssues = issueSchema.array().parse(data);
						resolve({ data: savedIssues });
					});
				}),
		);
		const user = renderIssues(view === 'List' ? <ListView /> : <TableView />);
		const key = await screen.findByRole('button', { name: 'Key uncertainty' });
		expect(key).toHaveAttribute('aria-pressed', 'false');
		await user.click(key);
		const used =
			view === 'List'
				? await screen.findByRole('table', { name: 'Issues used in the influence diagram' })
				: screen.getByRole('region', { name: 'Uncertainty issues' });

		const selected = within(used).getByRole('button', { name: 'Key uncertainty' });
		expect(selected).toHaveAttribute('aria-pressed', 'true');
		expect(selected).toBeEnabled();
		await user.click(selected);
		await waitFor(() =>
			expect(screen.getByRole('button', { name: 'Key uncertainty' })).toHaveAttribute(
				'aria-pressed',
				'false',
			),
		);
		expect(apiClient.put).toHaveBeenCalledTimes(1);
		expect(apiClient.put).toHaveBeenNthCalledWith(1, '/issues', [
			{
				...original,
				uncertainty: { ...original.uncertainty, is_key: true },
			},
		]);
		await act(async () => finishes[0]());
		await waitFor(() => expect(apiClient.put).toHaveBeenCalledTimes(2));
		expect(apiClient.put).toHaveBeenNthCalledWith(2, '/issues', [original]);
		await act(async () => finishes[1]());
		await waitFor(() => expect(savedIssues).toEqual([original]));
		expect(screen.getByRole('button', { name: 'Key uncertainty' })).toBeEnabled();
	},
);

test('List boundary menu checks In, dismisses outside, and moves a Focus decision when changed to Out', async () => {
	const original = makeIssue();
	const user = renderIssues();
	const trigger = await screen.findByRole('button', { name: 'Boundary: In' });
	await user.click(trigger);
	let menu = screen.getByRole('menu', { name: 'BOUNDARY' });
	expect(
		within(menu)
			.getAllByRole('menuitem')
			.map(item => item.textContent),
	).toEqual(['In', 'On', 'Out']);
	expect(within(menu).getByRole('menuitem', { name: 'In' })).toHaveAttribute(
		'aria-current',
		'true',
	);
	await user.click(screen.getByRole('heading', { name: 'Issues' }));
	expect(screen.queryByRole('menu', { name: 'BOUNDARY' })).not.toBeInTheDocument();
	expect(apiClient.put).not.toHaveBeenCalled();
	await user.click(trigger);
	menu = screen.getByRole('menu', { name: 'BOUNDARY' });
	await user.click(within(menu).getByRole('menuitem', { name: 'Out' }));
	await waitFor(() => {
		expect(
			within(screen.getByRole('table', { name: 'Issues filtered out' })).getByText(
				'Drill well',
			),
		).toBeInTheDocument();
	});
	expect(savedIssues).toEqual([{ ...original, boundary: 'out' }]);
});

test('Board type change moves the intact card to its existing column and shows only relevant controls', async () => {
	const original = makeIssue();
	const user = renderIssues(<TableView />);
	await user.click(await screen.findByRole('button', { name: 'Issue type: Decision' }));
	const menu = screen.getByRole('menu', { name: 'ISSUE TYPE' });
	expect(within(menu).getByRole('menuitem', { name: 'Utility' })).toBeInTheDocument();
	await user.click(within(menu).getByRole('menuitem', { name: 'Uncertainty' }));
	await waitFor(() => {
		expect(
			within(screen.getByRole('region', { name: 'Uncertainty issues' })).getByText(
				'Drill well',
			),
		).toBeInTheDocument();
	});
	expect(
		within(screen.getByRole('region', { name: 'Decision issues' })).queryByText('Drill well'),
	).not.toBeInTheDocument();
	expect(screen.queryByRole('button', { name: /Decision type:/ })).not.toBeInTheDocument();
	expect(screen.getByRole('button', { name: 'Key uncertainty' })).toHaveAttribute(
		'aria-pressed',
		'false',
	);
	await waitFor(() => expect(savedIssues).toEqual([{ ...original, type: 'Uncertainty' }]));
});

test.each(['Enter', 'ArrowDown', 'ArrowUp'])(
	'Classification menus use EDS keyboard navigation when opened with %s',
	async key => {
		const user = renderIssues();
		const trigger = await screen.findByRole('button', { name: 'Decision type: Focus' });
		trigger.focus();
		await user.keyboard(`{${key}}`);
		const menu = screen.getByRole('menu', { name: 'DECISION TYPE' });
		await waitFor(() =>
			expect(
				within(menu).getByRole('menuitem', {
					name: key === 'ArrowUp' ? 'Tactical' : 'Policy',
				}),
			).toHaveFocus(),
		);
		await user.keyboard('{ArrowDown}');
		await waitFor(() =>
			expect(
				within(menu).getByRole('menuitem', {
					name: key === 'ArrowUp' ? 'Policy' : 'Focus',
				}),
			).toHaveFocus(),
		);
		await user.keyboard('{ArrowUp}');
		await waitFor(() =>
			expect(
				within(menu).getByRole('menuitem', {
					name: key === 'ArrowUp' ? 'Tactical' : 'Policy',
				}),
			).toHaveFocus(),
		);
		await user.keyboard('{Escape}');
		expect(screen.queryByRole('menu', { name: 'DECISION TYPE' })).not.toBeInTheDocument();
		expect(trigger).toHaveFocus();
		expect(apiClient.put).not.toHaveBeenCalled();
	},
);

test.each(['List', 'Board'])(
	'%s menus expose all options, skip unchanged values, and dismiss cleanly',
	async view => {
		const user = renderIssues(view === 'List' ? <ListView /> : <TableView />);
		await screen.findByText('Drill well');
		for (const [label, title, current, options] of [
			[
				'Issue type: Decision',
				'ISSUE TYPE',
				'Decision',
				['Unassigned', 'Decision', 'Uncertainty', 'Fact', 'Utility'],
			],
			['Decision type: Focus', 'DECISION TYPE', 'Focus', ['Policy', 'Focus', 'Tactical']],
			['Boundary: In', 'BOUNDARY', 'In', ['In', 'On', 'Out']],
		] as const) {
			const trigger = screen.getByRole('button', { name: label });
			await user.click(trigger);
			const menu = screen.getByRole('menu', { name: title });
			expect(
				within(menu)
					.getAllByRole('menuitem')
					.map(item => item.textContent),
			).toEqual(options);
			expect(within(menu).getByRole('menuitem', { name: current })).toHaveAttribute(
				'aria-current',
				'true',
			);
			await user.click(within(menu).getByRole('menuitem', { name: current }));
			expect(screen.queryByRole('menu', { name: title })).not.toBeInTheDocument();
			await user.click(trigger);
			await user.keyboard('{Escape}');
			expect(screen.queryByRole('menu', { name: title })).not.toBeInTheDocument();
			await user.click(trigger);
			await user.click(
				screen.getByRole('heading', { name: view === 'List' ? 'Issues' : 'Decision' }),
			);
			expect(screen.queryByRole('menu', { name: title })).not.toBeInTheDocument();
		}
		expect(apiClient.put).not.toHaveBeenCalled();
	},
);

test.each(['List', 'Board'])(
	'%s failed type change restores the original type and placement',
	async view => {
		let fail!: () => void;
		vi.mocked(apiClient.put).mockImplementation(
			() =>
				new Promise((_resolve, reject) => {
					fail = () => reject(new Error('Update failed'));
				}),
		);
		const user = renderIssues(view === 'List' ? <ListView /> : <TableView />);
		await user.click(await screen.findByRole('button', { name: 'Issue type: Decision' }));
		await user.click(
			within(screen.getByRole('menu', { name: 'ISSUE TYPE' })).getByRole('menuitem', {
				name: 'Unassigned',
			}),
		);
		expect(
			await screen.findByRole('button', { name: 'Issue type: Unassigned' }),
		).toBeInTheDocument();
		const movedGroup =
			view === 'List'
				? screen.getByRole('table', { name: 'Issues filtered out' })
				: screen.getByRole('region', { name: 'Unassigned issues' });
		expect(within(movedGroup).getByText('Drill well')).toBeInTheDocument();
		await act(async () => fail());
		expect(
			await screen.findByRole('button', { name: 'Issue type: Decision' }),
		).toBeInTheDocument();
		const restoredGroup =
			view === 'List'
				? screen.getByRole('table', { name: 'Issues used in the influence diagram' })
				: screen.getByRole('region', { name: 'Decision issues' });
		expect(within(restoredGroup).getByText('Drill well')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Decision type: Focus' })).toBeInTheDocument();
		expect(screen.getByText('Failed to update issue')).toBeInTheDocument();
	},
);

test('Board Utility conversion retains its existing behavior without a column or special notification', async () => {
	const original = makeIssue();
	const user = renderIssues(<TableView />);
	await user.click(await screen.findByRole('button', { name: 'Issue type: Decision' }));
	await user.click(
		within(screen.getByRole('menu', { name: 'ISSUE TYPE' })).getByRole('menuitem', {
			name: 'Utility',
		}),
	);
	await waitFor(() => expect(savedIssues).toEqual([{ ...original, type: 'Utility' }]));
	expect(screen.queryByText('Drill well')).not.toBeInTheDocument();
	expect(screen.queryByRole('region', { name: 'Utility issues' })).not.toBeInTheDocument();
	expect(
		screen
			.getAllByRole('region', { name: /issues$/ })
			.map(region => region.getAttribute('aria-label')),
	).toEqual(['Unassigned issues', 'Decision issues', 'Uncertainty issues', 'Fact issues']);
	expect(screen.queryByText(/converted|conversion|updated/i)).not.toBeInTheDocument();
});

test.each(['List', 'Board'])('%s can turn a saved key uncertainty off', async view => {
	const original = makeIssue({ type: 'Uncertainty' });
	original.uncertainty.is_key = true;
	savedIssues = [original];
	const user = renderIssues(view === 'List' ? <ListView /> : <TableView />);
	await user.click(await screen.findByRole('button', { name: 'Key uncertainty' }));
	await waitFor(() =>
		expect(screen.getByRole('button', { name: 'Key uncertainty' })).toHaveAttribute(
			'aria-pressed',
			'false',
		),
	);
	await waitFor(() =>
		expect(savedIssues).toEqual([
			{ ...original, uncertainty: { ...original.uncertainty, is_key: false } },
		]),
	);
	if (view === 'List') {
		expect(
			within(screen.getByRole('table', { name: 'Issues filtered out' })).getByText(
				'Drill well',
			),
		).toBeInTheDocument();
	}
});

test.each<[Issue['type'], Issue['boundary'], Issue['decision']['type'], boolean, boolean]>([
	['Decision', 'in', 'Focus', false, true],
	['Decision', 'on', 'Focus', false, true],
	['Decision', 'out', 'Focus', false, false],
	['Decision', 'in', 'Policy', false, false],
	['Decision', 'on', 'Tactical', false, false],
	['Uncertainty', 'in', 'Policy', true, true],
	['Uncertainty', 'on', 'Policy', true, true],
	['Uncertainty', 'out', 'Policy', true, false],
	['Uncertainty', 'in', 'Policy', false, false],
	['Utility', 'in', 'Policy', false, true],
	['Utility', 'on', 'Policy', false, true],
	['Utility', 'out', 'Policy', false, false],
	['Fact', 'in', 'Policy', false, false],
	['Unassigned', 'on', 'Policy', false, false],
])(
	'List retains %s/%s/%s/key=%s diagram grouping',
	async (type, boundary, decisionType, key, used) => {
		const issue = makeIssue({ type, boundary });
		issue.decision.type = decisionType;
		issue.uncertainty.is_key = key;
		savedIssues = [issue];
		renderIssues();
		const table = await screen.findByRole('table', {
			name: used ? 'Issues used in the influence diagram' : 'Issues filtered out',
		});
		expect(within(table).getByText('Drill well')).toBeInTheDocument();
		if (type !== 'Decision') {
			expect(
				screen.queryByRole('button', { name: /Decision type:/ }),
			).not.toBeInTheDocument();
		}
		if (type !== 'Uncertainty') {
			expect(
				screen.queryByRole('button', { name: 'Key uncertainty' }),
			).not.toBeInTheDocument();
		}
	},
);

const StateSelectionCard = () => {
	const issue = makeIssue({ type: 'Uncertainty' });
	const [selectedState, setSelectedState] = useState<Option | Outcome>();
	return (
		<>
			<IssueCard issue={issue} onClickState={setSelectedState} selectedState={selectedState}>
				<IssueCardHeader />
				<IssueCardContent />
				<IssueCardStates expandedProp />
			</IssueCard>
			<output aria-label='Selected state'>{selectedState?.name ?? 'None'}</output>
		</>
	);
};

test('Non-Board shared cards retain state selection and do not acquire classification menus', async () => {
	const user = renderIssues(<StateSelectionCard />);
	expect(screen.queryByRole('button', { name: /Issue type:|Boundary:/ })).not.toBeInTheDocument();
	const key = screen.getByRole('button', { name: 'Key uncertainty' });
	expect(key).toHaveAttribute('tabindex', '-1');
	expect(key).toHaveClass('pointer-events-none');
	expect(key).not.toHaveAttribute('aria-haspopup');
	expect(screen.queryByRole('menu')).not.toBeInTheDocument();
	expect(screen.getByRole('status', { name: 'Selected state' })).toHaveTextContent('None');
	await user.click(screen.getByText('High'));
	expect(screen.getByRole('status', { name: 'Selected state' })).toHaveTextContent('High');
	expect(apiClient.put).not.toHaveBeenCalled();
});

test('Board decision type and boundary changes save from their menus without losing other values', async () => {
	const original = makeIssue();
	const user = renderIssues(<TableView />);
	const trigger = await screen.findByRole('button', { name: 'Decision type: Focus' });
	trigger.focus();
	await user.keyboard('{Enter}');
	await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Policy' })).toHaveFocus());
	await user.keyboard('{Enter}');
	await waitFor(() =>
		expect(screen.getByRole('button', { name: 'Decision type: Policy' })).not.toBeDisabled(),
	);
	expect(savedIssues).toEqual([
		{ ...original, decision: { ...original.decision, type: 'Policy' } },
	]);
	await user.click(screen.getByRole('button', { name: 'Boundary: In' }));
	await user.click(
		within(screen.getByRole('menu', { name: 'BOUNDARY' })).getByRole('menuitem', {
			name: 'On',
		}),
	);
	await waitFor(() =>
		expect(screen.getByRole('button', { name: 'Boundary: On' })).not.toBeDisabled(),
	);
	expect(savedIssues).toEqual([
		{ ...original, boundary: 'on', decision: { ...original.decision, type: 'Policy' } },
	]);
	expect(
		within(screen.getByRole('region', { name: 'Decision issues' })).getByText('Drill well'),
	).toBeInTheDocument();
});

test.each([
	['List', 'Decision type: Focus', 'DECISION TYPE', 'Policy', 'Decision type: Policy'],
	['Board', 'Decision type: Focus', 'DECISION TYPE', 'Policy', 'Decision type: Policy'],
	['List', 'Boundary: In', 'BOUNDARY', 'Out', 'Boundary: Out'],
	['Board', 'Boundary: In', 'BOUNDARY', 'Out', 'Boundary: Out'],
])(
	'%s failed %s menu update restores its saved value',
	async (view, trigger, title, option, pendingLabel) => {
		let fail!: () => void;
		vi.mocked(apiClient.put).mockImplementation(
			() =>
				new Promise((_resolve, reject) => {
					fail = () => reject(new Error('Update failed'));
				}),
		);
		const user = renderIssues(view === 'List' ? <ListView /> : <TableView />);
		await user.click(await screen.findByRole('button', { name: trigger }));
		await user.click(
			within(screen.getByRole('menu', { name: title })).getByRole('menuitem', {
				name: option,
			}),
		);
		expect(await screen.findByRole('button', { name: pendingLabel })).toBeEnabled();
		await act(async () => fail());
		expect(await screen.findByRole('button', { name: trigger })).not.toBeDisabled();
		expect(screen.getByText('Failed to update issue')).toBeInTheDocument();
		if (view === 'List') {
			expect(
				within(
					screen.getByRole('table', { name: 'Issues used in the influence diagram' }),
				).getByText('Drill well'),
			).toBeInTheDocument();
		}
		expect(savedIssues).toEqual([makeIssue()]);
	},
);

test('Board retains its existing full Edit action and expandable states', async () => {
	const user = renderIssues(<TableView />);
	const column = await screen.findByRole('region', { name: 'Decision issues' });
	await screen.findByText('Drill well');
	await user.click(within(column).getByRole('button', { name: '1 States' }));
	expect(await screen.findByText('Drill now')).toBeInTheDocument();
	await user.click(within(column).getByRole('button', { name: 'Issue actions' }));
	await user.click(screen.getByRole('menuitem', { name: 'Edit' }));
	expect(screen.getByRole('textbox', { name: 'Issue name' })).toHaveValue('Drill well');
});
