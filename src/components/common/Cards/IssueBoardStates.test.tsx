import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosAdapter } from 'axios';
import { Provider } from 'jotai';
import { useState } from 'react';
import { Toaster, toast } from 'sonner';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { apiClient } from '../../../api';
import { existingIssue, project } from '../../../test/issueFixtures';
import { canDndStartFrom } from '../../../utils/canDndStartFrom';
import { Issue } from '../../../validators';
import { ProjectContext } from '../../ProjectPage/ProjectContext';
import { TableView } from '../../ProjectPage/ProjectIssues/TableView/TableView';
import { IssueCard, IssueCardContent, IssueCardStates } from './IssueCard';

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

let savedIssue: Issue;
let requests: Issue[];

const adapter: AxiosAdapter = async config => {
	if (config.method === 'put') {
		const [updated]: Issue[] = JSON.parse(config.data);
		requests.push(updated);
		savedIssue = updated;
	}
	return {
		config,
		status: 200,
		statusText: 'OK',
		headers: {},
		data: [structuredClone(savedIssue)],
	};
};

beforeEach(() => {
	savedIssue = existingIssue();
	requests = [];
	apiClient.interceptors.request.clear();
	apiClient.defaults.adapter = adapter;
});

afterEach(() => toast.dismiss());

const renderBoard = async (expand = true) => {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	render(
		<Provider>
			<QueryClientProvider client={queryClient}>
				<ProjectContext value={project}>
					<TableView />
				</ProjectContext>
				<Toaster />
			</QueryClientProvider>
		</Provider>,
	);
	const user = userEvent.setup();
	await screen.findByRole('button', { name: 'Edit issue name: Existing issue' });
	if (expand) await user.click(screen.getByRole('button', { name: /^\d+ States$/ }));
	return user;
};

const expectControlOnlyDragBlocking = (card: HTMLElement) => {
	expect(card).not.toHaveAttribute('data-no-dnd');
	expect(canDndStartFrom(card)).toBe(true);
	expect(card).toHaveAttribute('data-dragging', 'false');
	const controls = [
		...within(card).queryAllByRole('textbox'),
		...within(card).queryAllByRole('spinbutton'),
	];
	expect(controls.length).toBeGreaterThan(0);
	for (const control of controls) {
		expect(canDndStartFrom(control)).toBe(false);
		expect(control.closest('.nodrag')).not.toBeNull();
	}
};

test.each(['Decision', 'Uncertainty'] as const)(
	'a member adds the first %s state with a new identity and zero utility, preserving the issue',
	async type => {
		savedIssue.type = type;
		if (type === 'Decision') savedIssue.decision.options = [];
		else savedIssue.uncertainty.outcomes = [];
		const original = structuredClone(savedIssue);
		const stateType = type === 'Decision' ? 'option' : 'outcome';
		const user = await renderBoard(false);
		expect(screen.queryByRole('button', { name: /^\d+ States$/ })).toBeNull();
		await user.click(screen.getByRole('button', { name: `Add ${stateType}` }));
		const name = screen.getByRole('textbox', { name: 'Name' });
		expect(name).toHaveFocus();
		expect(name).toHaveValue('');
		const utility = screen.getByRole('spinbutton', { name: 'Utility' });
		expect(utility).toHaveValue(0);
		await user.type(name, ' First state ');
		await user.tab();
		expect(utility).toHaveFocus();
		await user.clear(utility);
		await user.keyboard('{Enter}');
		expect(await screen.findByText('First state')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: '1 States' })).toBeInTheDocument();
		expect(requests).toHaveLength(1);
		const states =
			type === 'Decision' ? requests[0].decision.options : requests[0].uncertainty.outcomes;
		expect(states).toEqual([
			{
				id: expect.stringMatching(/^[0-9a-f-]{36}$/),
				name: ' First state ',
				utility: 0,
				project_id: original.project_id,
				created_at: expect.any(String),
				...(type === 'Decision'
					? { decision_id: original.decision.id }
					: { uncertainty_id: original.uncertainty.id }),
			},
		]);
		expect(requests[0]).toEqual(
			type === 'Decision'
				? { ...original, decision: { ...original.decision, options: states } }
				: { ...original, uncertainty: { ...original.uncertainty, outcomes: states } },
		);
		await user.click(screen.getByRole('button', { name: 'Issue actions' }));
		await user.click(await screen.findByRole('menuitem', { name: 'Edit' }));
		const dialog = screen.getByRole('dialog', { name: 'Edit Issue' });
		expect(
			within(dialog).getByRole('textbox', {
				name: type === 'Decision' ? 'Option 1' : 'Outcome 1 Name',
			}),
		).toHaveValue(' First state ');
		await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
		expect(requests).toHaveLength(1);
	},
);

test('a member edits an existing option from its name and Enter saves the intact issue', async () => {
	const original = structuredClone(savedIssue);
	const user = await renderBoard();
	await user.click(screen.getByText('Existing option'));
	const name = screen.getByRole('textbox', { name: 'Name' });
	expect(name).toHaveFocus();
	expect(screen.getByRole('spinbutton', { name: 'Utility' })).toHaveValue(7);
	await user.clear(name);
	await user.type(name, 'Drill now{Enter}');
	await waitFor(() => expect(screen.queryByRole('textbox', { name: 'Name' })).toBeNull());
	expect(screen.getByText('Drill now')).toBeInTheDocument();
	expect(requests).toEqual([
		{
			...original,
			decision: {
				...original.decision,
				options: [{ ...original.decision.options[0], name: 'Drill now' }],
			},
		},
	]);
	expect(
		within(screen.getByRole('region', { name: 'Decision issues' })).getByText('7'),
	).toBeInTheDocument();
});

test('idle state actions and row spacing allow dragging while active inputs do not', async () => {
	const user = await renderBoard(false);
	const expand = screen.getByRole('button', { name: /^\d+ States$/ });
	const footer = expand.parentElement!;
	expect(canDndStartFrom(footer)).toBe(true);
	expect(canDndStartFrom(expand)).toBe(true);
	expect(canDndStartFrom(expand.querySelector('svg'))).toBe(true);
	await user.click(expand);
	const name = screen.getByRole('button', { name: 'Edit option name: Existing option' });
	const utility = screen.getByRole('button', { name: 'Edit option utility: Existing option' });
	expect(canDndStartFrom(name.closest('li'))).toBe(true);
	expect(canDndStartFrom(name)).toBe(true);
	expect(canDndStartFrom(utility)).toBe(true);
	expect(canDndStartFrom(screen.getByRole('button', { name: 'Add option' }))).toBe(true);
	const draggable = name.closest<HTMLElement>('[data-dragging]')!;
	await user.click(name);
	expect(canDndStartFrom(footer)).toBe(true);
	expectControlOnlyDragBlocking(draggable);
});

test.each(['Decision', 'Uncertainty'] as const)(
	'%s utility receives clicked focus, can be cleared to zero and saves only after leaving the row',
	async type => {
		savedIssue.type = type;
		const original = structuredClone(savedIssue);
		const user = await renderBoard();
		const column = screen.getByRole('region', { name: `${type} issues` });
		await user.click(within(column).getByText(type === 'Decision' ? '7' : '-2'));
		const utility = screen.getByRole('spinbutton', { name: 'Utility' });
		expect(utility).toHaveFocus();
		await user.clear(utility);
		await user.click(screen.getByRole('textbox', { name: 'Name' }));
		expect(requests).toHaveLength(0);
		expect(utility).toHaveValue(null);
		await user.click(within(column).getByRole('heading', { name: type }));
		await waitFor(() => expect(screen.queryByRole('textbox', { name: 'Name' })).toBeNull());
		expect(within(column).getByText('0')).toBeInTheDocument();
		expect(requests).toEqual([
			type === 'Decision'
				? {
						...original,
						decision: {
							...original.decision,
							options: [{ ...original.decision.options[0], utility: 0 }],
						},
					}
				: {
						...original,
						uncertainty: {
							...original.uncertainty,
							outcomes: [{ ...original.uncertainty.outcomes[0], utility: 0 }],
						},
					},
		]);
	},
);

const addSecondState = (type: 'Decision' | 'Uncertainty') => {
	savedIssue.type = type;
	if (type === 'Decision') {
		const first = {
			...savedIssue.decision.options[0],
			created_at: '2026-10-01T00:00:00Z',
		};
		savedIssue.decision.options = [
			{
				...first,
				id: '00000000-0000-4000-8000-000000000011',
				name: 'Later option',
				utility: 3,
				created_at: '2026-10-02T00:00:00Z',
			},
			first,
		];
	} else {
		const first = {
			...savedIssue.uncertainty.outcomes[0],
			created_at: '2026-10-01T00:00:00Z',
		};
		savedIssue.uncertainty.outcomes = [
			{
				...first,
				id: '00000000-0000-4000-8000-000000000012',
				name: 'Later outcome',
				utility: 3,
				created_at: '2026-10-02T00:00:00Z',
			},
			first,
		];
	}
};

test.each(['Decision', 'Uncertainty'] as const)(
	'a member removes a saved %s state without saving its draft or changing remaining identity and order',
	async type => {
		addSecondState(type);
		const original = structuredClone(savedIssue);
		const stateType = type === 'Decision' ? 'option' : 'outcome';
		const user = await renderBoard();
		await user.click(screen.getByText(`Existing ${stateType}`));
		await user.clear(screen.getByRole('textbox', { name: 'Name' }));
		await user.click(screen.getByRole('button', { name: `Remove ${stateType}` }));
		await waitFor(() => expect(screen.queryByRole('textbox', { name: 'Name' })).toBeNull());
		expect(screen.queryByText(`Existing ${stateType}`)).toBeNull();
		expect(screen.getByText(`Later ${stateType}`)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: '1 States' })).toBeInTheDocument();
		expect(screen.queryByRole('dialog')).toBeNull();
		expect(requests).toEqual([
			type === 'Decision'
				? {
						...original,
						decision: { ...original.decision, options: [original.decision.options[0]] },
					}
				: {
						...original,
						uncertainty: {
							...original.uncertainty,
							outcomes: [original.uncertainty.outcomes[0]],
						},
					},
		]);
	},
);

test.each(['Decision', 'Uncertainty'] as const)(
	'a %s state can be removed by keyboard without putting Remove between Name, Utility and the next Name',
	async type => {
		savedIssue.type = type;
		const stateType = type === 'Decision' ? 'option' : 'outcome';
		const user = await renderBoard();
		await user.click(screen.getByText(`Existing ${stateType}`));
		await user.clear(screen.getByRole('textbox', { name: 'Name' }));
		await user.tab({ shift: true });
		expect(screen.getByRole('button', { name: `Remove ${stateType}` })).toHaveFocus();
		await user.keyboard('{Enter}');
		await waitFor(() => expect(screen.queryByRole('textbox', { name: 'Name' })).toBeNull());
		expect(screen.queryByRole('button', { name: /^\d+ States$/ })).toBeNull();
		expect(screen.getByRole('button', { name: `Add ${stateType}` })).toBeEnabled();
		expect(requests).toHaveLength(1);
		expect(
			type === 'Decision' ? requests[0].decision.options : requests[0].uncertainty.outcomes,
		).toEqual([]);
	},
);

test.each([
	['Decision', 'Remove'],
	['Decision', 'Escape'],
	['Uncertainty', 'Remove'],
	['Uncertainty', 'Escape'],
] as const)(
	'cancelling an unsaved first %s state with %s discards only the local row',
	async (type, cancel) => {
		savedIssue.type = type;
		if (type === 'Decision') savedIssue.decision.options = [];
		else savedIssue.uncertainty.outcomes = [];
		const stateType = type === 'Decision' ? 'option' : 'outcome';
		const user = await renderBoard(false);
		await user.click(screen.getByRole('button', { name: `Add ${stateType}` }));
		if (cancel === 'Escape') await user.keyboard('{Escape}');
		else await user.click(screen.getByRole('button', { name: `Remove ${stateType}` }));
		expect(screen.queryByRole('textbox', { name: 'Name' })).toBeNull();
		expect(screen.queryByRole('listitem')).toBeNull();
		expect(screen.queryByRole('button', { name: /^\d+ States$/ })).toBeNull();
		expect(screen.getByRole('button', { name: `Add ${stateType}` })).toBeEnabled();
		expect(requests).toHaveLength(0);
	},
);

test.each(['Decision', 'Uncertainty'] as const)(
	'Add on a %s card guards invalid rows, saves a changed row first and appends new states in stored order',
	async type => {
		addSecondState(type);
		const original = structuredClone(savedIssue);
		const stateType = type === 'Decision' ? 'option' : 'outcome';
		const user = await renderBoard();
		await user.click(screen.getByText(`Existing ${stateType}`));
		await user.clear(screen.getByRole('textbox', { name: 'Name' }));
		await user.type(screen.getByRole('textbox', { name: 'Name' }), '   ');
		await user.click(screen.getByRole('button', { name: `Add ${stateType}` }));
		expect(await screen.findByText(/name is required/)).toBeInTheDocument();
		expect(screen.getByText('Esc to cancel')).toBeInTheDocument();
		expect(screen.getByRole('textbox', { name: 'Name' })).toHaveFocus();
		expect(requests).toHaveLength(0);
		await user.clear(screen.getByRole('textbox', { name: 'Name' }));
		await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Saved before adding');
		await user.click(screen.getByRole('button', { name: `Add ${stateType}` }));
		await waitFor(() => expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue(''));
		expect(screen.getByRole('textbox', { name: 'Name' })).toHaveFocus();
		expect(screen.getAllByRole('textbox', { name: 'Name' })).toHaveLength(1);
		await user.type(screen.getByRole('textbox', { name: 'Name' }), 'New third state');
		await user.click(screen.getByRole('button', { name: `Add ${stateType}` }));
		await waitFor(() => expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue(''));
		await user.type(screen.getByRole('textbox', { name: 'Name' }), 'New fourth state{Enter}');
		expect(await screen.findByRole('button', { name: '4 States' })).toBeInTheDocument();
		expect(screen.getAllByRole('listitem').map(row => row.textContent)).toEqual([
			`Saved before adding${type === 'Decision' ? 7 : -2}`,
			`Later ${stateType}3`,
			'New third state0',
			'New fourth state0',
		]);
		expect(requests).toHaveLength(3);
		const states =
			type === 'Decision' ? requests[2].decision.options : requests[2].uncertainty.outcomes;
		const originalStates =
			type === 'Decision' ? original.decision.options : original.uncertainty.outcomes;
		expect(states.slice(0, 2)).toEqual([
			originalStates[0],
			{ ...originalStates[1], name: 'Saved before adding' },
		]);
		expect(new Set(states.map(state => state.id)).size).toBe(4);
		expect(requests[2]).toEqual(
			type === 'Decision'
				? { ...original, decision: { ...original.decision, options: states } }
				: { ...original, uncertainty: { ...original.uncertainty, outcomes: states } },
		);
	},
);

test.each([
	['Decision', '', 'Escape'],
	['Decision', '   ', 'Remove'],
	['Uncertainty', '', 'Remove'],
	['Uncertainty', '   ', 'Escape'],
] as const)(
	'a new %s state rejects "%s" on Enter, outside click and Add, then %s discards the unsaved row',
	async (type, invalidName, cancel) => {
		savedIssue.type = type;
		const original = structuredClone(savedIssue);
		const stateType = type === 'Decision' ? 'option' : 'outcome';
		const user = await renderBoard();
		await user.click(screen.getByRole('button', { name: `Add ${stateType}` }));
		const name = screen.getByRole('textbox', { name: 'Name' });
		if (invalidName) await user.type(name, invalidName);
		await user.keyboard('{Enter}');
		expect(await screen.findByText(/name is required/)).toBeInTheDocument();
		expect(name).toHaveAttribute('aria-invalid', 'true');
		expect(name).toHaveFocus();
		await user.click(screen.getByRole('heading', { name: type }));
		expect(name).toHaveFocus();
		await user.click(screen.getByRole('button', { name: `Add ${stateType}` }));
		expect(screen.getAllByRole('textbox', { name: 'Name' })).toHaveLength(1);
		expect(name).toHaveValue(invalidName);
		expect(screen.getByRole('button', { name: '1 States' })).toBeInTheDocument();
		if (cancel === 'Escape') await user.keyboard('{Escape}');
		else await user.click(screen.getByRole('button', { name: `Remove ${stateType}` }));
		expect(screen.queryByRole('textbox', { name: 'Name' })).toBeNull();
		expect(screen.queryByText('Esc to cancel')).toBeNull();
		expect(screen.getAllByRole('listitem')).toHaveLength(1);
		expect(screen.getByText(`Existing ${stateType}`)).toBeInTheDocument();
		expect(savedIssue).toEqual(original);
		expect(requests).toHaveLength(0);
	},
);

test.each(['Decision', 'Uncertainty'] as const)(
	'removing the last %s state leaves Add without a States toggle and full Edit sees the saved empty list',
	async type => {
		savedIssue.type = type;
		const original = structuredClone(savedIssue);
		const stateType = type === 'Decision' ? 'option' : 'outcome';
		const user = await renderBoard();
		await user.click(screen.getByText(`Existing ${stateType}`));
		await user.click(screen.getByRole('button', { name: `Remove ${stateType}` }));
		await waitFor(() => expect(screen.queryByRole('textbox', { name: 'Name' })).toBeNull());
		expect(screen.queryByRole('listitem')).toBeNull();
		expect(screen.queryByRole('button', { name: /^\d+ States$/ })).toBeNull();
		expect(screen.getByRole('button', { name: `Add ${stateType}` })).toBeEnabled();
		expect(requests).toEqual([
			type === 'Decision'
				? { ...original, decision: { ...original.decision, options: [] } }
				: { ...original, uncertainty: { ...original.uncertainty, outcomes: [] } },
		]);
		await user.click(screen.getByRole('button', { name: 'Issue actions' }));
		await user.click(await screen.findByRole('menuitem', { name: 'Edit' }));
		const dialog = screen.getByRole('dialog', { name: 'Edit Issue' });
		expect(
			within(dialog).queryByRole('textbox', {
				name: type === 'Decision' ? 'Option 1' : 'Outcome 1 Name',
			}),
		).toBeNull();
		expect(within(dialog).getByRole('textbox', { name: 'Issue name' })).toHaveValue(
			original.name,
		);
		await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
		await user.click(screen.getByRole('button', { name: `Add ${stateType}` }));
		expect(screen.getByRole('textbox', { name: 'Name' })).toHaveFocus();
		await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Replacement{Enter}');
		expect(await screen.findByText('Replacement')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: '1 States' })).toBeInTheDocument();
		const states =
			type === 'Decision' ? requests[1].decision.options : requests[1].uncertainty.outcomes;
		expect(states[0].id).not.toBe(
			type === 'Decision'
				? original.decision.options[0].id
				: original.uncertainty.outcomes[0].id,
		);
	},
);

test.each([
	['Decision', 'add'],
	['Decision', 'remove'],
	['Uncertainty', 'add'],
	['Uncertainty', 'remove'],
] as const)(
	'a failed first %s %s restores the saved list and correct empty-state controls',
	async (type, operation) => {
		savedIssue.type = type;
		if (operation === 'add') {
			if (type === 'Decision') savedIssue.decision.options = [];
			else savedIssue.uncertainty.outcomes = [];
		}
		const original = structuredClone(savedIssue);
		apiClient.defaults.adapter = async config => {
			if (config.method === 'put') {
				requests.push(JSON.parse(config.data)[0]);
				throw new Error('Network unavailable');
			}
			return adapter(config);
		};
		const stateType = type === 'Decision' ? 'option' : 'outcome';
		const user = await renderBoard(operation === 'remove');
		if (operation === 'add') {
			await user.click(screen.getByRole('button', { name: `Add ${stateType}` }));
			await user.type(
				screen.getByRole('textbox', { name: 'Name' }),
				'Rejected first state{Enter}',
			);
		} else {
			await user.click(screen.getByText(`Existing ${stateType}`));
			await user.click(screen.getByRole('button', { name: `Remove ${stateType}` }));
		}
		expect(await screen.findByText('Failed to update issue')).toBeInTheDocument();
		expect(screen.queryByRole('textbox', { name: 'Name' })).toBeNull();
		expect(screen.queryByText('Rejected first state')).toBeNull();
		if (operation === 'add')
			expect(screen.queryByRole('button', { name: /^\d+ States$/ })).toBeNull();
		else {
			expect(screen.getByRole('button', { name: '1 States' })).toBeInTheDocument();
			expect(screen.getByText(`Existing ${stateType}`)).toBeInTheDocument();
		}
		expect(screen.getByRole('button', { name: `Add ${stateType}` })).toBeEnabled();
		expect(savedIssue).toEqual(original);
		expect(requests).toHaveLength(1);
	},
);

test.each([
	['Decision', 'add'],
	['Decision', 'remove'],
	['Uncertainty', 'add'],
	['Uncertainty', 'remove'],
] as const)(
	'a %s %s queued behind issue text preserves both updates even with a delayed issue refresh',
	async (type, operation) => {
		addSecondState(type);
		const original = structuredClone(savedIssue);
		let finish!: () => void;
		let delayRefresh = false;
		const refreshes: (() => void)[] = [];
		apiClient.defaults.adapter = async config => {
			const response = await adapter(config);
			if (config.method === 'put' && requests.length === 1) {
				await new Promise<void>(resolve => {
					finish = resolve;
				});
				delayRefresh = true;
			} else if (config.method === 'get' && delayRefresh) {
				await new Promise<void>(resolve => refreshes.push(resolve));
			}
			return response;
		};
		const stateType = type === 'Decision' ? 'option' : 'outcome';
		const user = await renderBoard();
		await user.click(screen.getByRole('button', { name: 'Edit issue name: Existing issue' }));
		await user.clear(screen.getByRole('textbox', { name: 'Issue name' }));
		await user.type(
			screen.getByRole('textbox', { name: 'Issue name' }),
			'Saved issue text{Enter}',
		);
		await waitFor(() => expect(requests).toHaveLength(1));
		if (operation === 'add') {
			await user.click(screen.getByRole('button', { name: `Add ${stateType}` }));
			await user.type(
				screen.getByRole('textbox', { name: 'Name' }),
				'Queued addition{Enter}',
			);
		} else {
			await user.click(screen.getByText(`Existing ${stateType}`));
			await user.click(screen.getByRole('button', { name: `Remove ${stateType}` }));
		}
		expect(screen.getByRole('textbox', { name: 'Name' })).toBeDisabled();
		expect(requests).toHaveLength(1);
		await act(async () => finish());
		await waitFor(() => expect(requests).toHaveLength(2));
		await waitFor(() => expect(screen.queryByRole('textbox', { name: 'Name' })).toBeNull());
		await act(async () => refreshes.forEach(resolve => resolve()));
		expect(
			screen.getByRole('button', { name: 'Edit issue name: Saved issue text' }),
		).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: operation === 'add' ? '3 States' : '1 States' }),
		).toBeInTheDocument();
		expect(screen.getByText(`Later ${stateType}`)).toBeInTheDocument();
		if (operation === 'add') expect(screen.getByText('Queued addition')).toBeInTheDocument();
		else expect(screen.queryByText(`Existing ${stateType}`)).toBeNull();
		const states =
			type === 'Decision' ? requests[1].decision.options : requests[1].uncertainty.outcomes;
		const originalStates =
			type === 'Decision' ? original.decision.options : original.uncertainty.outcomes;
		expect(states.slice(0, operation === 'add' ? 2 : 1)).toEqual(
			operation === 'add' ? originalStates : [originalStates[0]],
		);
		expect(requests[1]).toEqual(
			type === 'Decision'
				? {
						...original,
						name: 'Saved issue text',
						decision: { ...original.decision, options: states },
					}
				: {
						...original,
						name: 'Saved issue text',
						uncertainty: { ...original.uncertainty, outcomes: states },
					},
		);
	},
);

test.each([
	['Decision', 'add'],
	['Decision', 'remove'],
	['Uncertainty', 'add'],
	['Uncertainty', 'remove'],
] as const)(
	'a pending %s %s blocks control dragging and row actions, rejects duplicate requests and rolls back on HTTP failure',
	async (type, operation) => {
		addSecondState(type);
		const original = structuredClone(savedIssue);
		let fail!: () => void;
		apiClient.defaults.adapter = async config => {
			if (config.method === 'put') {
				requests.push(JSON.parse(config.data)[0]);
				await new Promise((_resolve, reject) => {
					fail = () => reject(new Error('Forbidden'));
				});
			}
			return adapter(config);
		};
		const stateType = type === 'Decision' ? 'option' : 'outcome';
		const user = await renderBoard();
		const column = within(screen.getByRole('region', { name: `${type} issues` }));
		const draggable = column
			.getByRole('button', { name: 'Edit issue name: Existing issue' })
			.closest<HTMLElement>('[data-dragging]')!;
		if (operation === 'add') {
			await user.click(screen.getByRole('button', { name: `Add ${stateType}` }));
			await user.type(
				screen.getByRole('textbox', { name: 'Name' }),
				'Rejected addition{Enter}',
			);
		} else {
			await user.click(screen.getByText(`Existing ${stateType}`));
			await user.click(screen.getByRole('button', { name: `Remove ${stateType}` }));
		}
		await waitFor(() => expect(requests).toHaveLength(1));
		expect(screen.getByRole('textbox', { name: 'Name' })).toBeDisabled();
		expect(screen.getByRole('spinbutton', { name: 'Utility' })).toBeDisabled();
		expect(screen.getByRole('button', { name: `Remove ${stateType}` })).toBeDisabled();
		expect(screen.getByRole('button', { name: `Add ${stateType}` })).toBeDisabled();
		expect(
			screen.getByRole('textbox', { name: 'Name' }).closest('[aria-disabled="true"]'),
		).toBeNull();
		expectControlOnlyDragBlocking(draggable);
		await user.keyboard('{Enter}{Escape}');
		await user.click(screen.getByRole('button', { name: `Remove ${stateType}` }));
		await user.click(screen.getByRole('button', { name: `Add ${stateType}` }));
		await user.click(screen.getByText(`Later ${stateType}`));
		await user.click(screen.getByRole('button', { name: '2 States' }));
		expect(screen.getByRole('button', { name: '2 States' })).toHaveAttribute(
			'aria-expanded',
			'true',
		);
		expect(screen.getAllByRole('textbox', { name: 'Name' })).toHaveLength(1);
		expect(requests).toHaveLength(1);
		await act(async () => fail());
		expect(await screen.findByText('Failed to update issue')).toBeInTheDocument();
		expect(screen.queryByRole('textbox', { name: 'Name' })).toBeNull();
		expect(screen.queryByText('Rejected addition')).toBeNull();
		expect(column.getAllByRole('listitem').map(row => row.textContent)).toEqual([
			`Existing ${stateType}${type === 'Decision' ? 7 : -2}`,
			`Later ${stateType}3`,
		]);
		expect(screen.getByRole('button', { name: '2 States' })).toBeInTheDocument();
		expect(draggable).not.toHaveAttribute('data-no-dnd');
		expect(savedIssue).toEqual(original);
	},
);

test.each(['Decision', 'Uncertainty'] as const)(
	'moving between %s rows saves the valid row first but never abandons an invalid row',
	async type => {
		addSecondState(type);
		const original = structuredClone(savedIssue);
		const stateType = type === 'Decision' ? 'option' : 'outcome';
		const user = await renderBoard();
		expect(screen.getAllByRole('listitem').map(row => row.textContent)).toEqual([
			`Existing ${stateType}${type === 'Decision' ? 7 : -2}`,
			`Later ${stateType}3`,
		]);
		await user.click(screen.getByText(`Existing ${stateType}`));
		await user.clear(screen.getByRole('textbox', { name: 'Name' }));
		await user.click(screen.getByText(`Later ${stateType}`));
		expect(await screen.findByText(/name is required/)).toBeInTheDocument();
		expect(screen.getAllByRole('textbox', { name: 'Name' })).toHaveLength(1);
		expect(screen.getByRole('textbox', { name: 'Name' })).toHaveFocus();
		expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('');
		expect(requests).toHaveLength(0);
		await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Saved first');
		await user.click(screen.getByText(`Later ${stateType}`));
		await waitFor(() =>
			expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue(`Later ${stateType}`),
		);

		expect(screen.getByRole('textbox', { name: 'Name' })).toHaveFocus();
		expect(screen.getAllByRole('textbox', { name: 'Name' })).toHaveLength(1);
		expect(screen.getByText('Saved first')).toBeInTheDocument();
		expect(requests).toEqual([
			type === 'Decision'
				? {
						...original,
						decision: {
							...original.decision,
							options: [
								original.decision.options[0],
								{ ...original.decision.options[1], name: 'Saved first' },
							],
						},
					}
				: {
						...original,
						uncertainty: {
							...original.uncertainty,
							outcomes: [
								original.uncertainty.outcomes[0],
								{ ...original.uncertainty.outcomes[1], name: 'Saved first' },
							],
						},
					},
		]);
	},
);

test.each(['Decision', 'Uncertainty'] as const)(
	'Tab twice moves from one %s Name to the next Name while retaining both saved rows',
	async type => {
		addSecondState(type);
		const stateType = type === 'Decision' ? 'option' : 'outcome';
		const user = await renderBoard();
		await user.click(screen.getByText(`Existing ${stateType}`));
		await user.clear(screen.getByRole('textbox', { name: 'Name' }));
		await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Saved first');
		await user.tab();
		expect(screen.getByRole('spinbutton', { name: 'Utility' })).toHaveFocus();
		expect(requests).toHaveLength(0);
		await user.tab();
		await waitFor(() =>
			expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue(`Later ${stateType}`),
		);
		expect(screen.getByRole('textbox', { name: 'Name' })).toHaveFocus();
		expect(requests).toHaveLength(1);
		await user.clear(screen.getByRole('spinbutton', { name: 'Utility' }));
		await user.type(screen.getByRole('spinbutton', { name: 'Utility' }), '12{Enter}');
		expect(await screen.findByText('12')).toBeInTheDocument();
		expect(screen.getAllByRole('listitem').map(row => row.textContent)).toEqual([
			`Saved first${type === 'Decision' ? 7 : -2}`,
			`Later ${stateType}12`,
		]);
		expect(requests).toHaveLength(2);
	},
);

test.each(['Decision', 'Uncertainty'] as const)(
	'unchanged %s rows close or move to the next row without sending unnecessary saves',
	async type => {
		addSecondState(type);
		const stateType = type === 'Decision' ? 'option' : 'outcome';
		const user = await renderBoard();
		await user.click(screen.getByText(`Existing ${stateType}`));
		await user.keyboard('{Enter}');
		expect(screen.queryByRole('textbox', { name: 'Name' })).toBeNull();
		await user.click(screen.getByText(`Existing ${stateType}`));
		await user.tab();
		await user.tab();
		expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue(`Later ${stateType}`);
		expect(screen.getByRole('textbox', { name: 'Name' })).toHaveFocus();
		await user.click(screen.getByRole('heading', { name: type }));
		expect(screen.queryByRole('textbox', { name: 'Name' })).toBeNull();
		expect(requests).toHaveLength(0);
	},
);

test.each(['Decision', 'Uncertainty'] as const)(
	'%s row fields have no disabled ARIA ancestor after Name → Utility Tab and only controls block dragging',
	async type => {
		savedIssue.type = type;
		const user = await renderBoard();
		const draggable = screen
			.getByRole('button', { name: 'Edit issue name: Existing issue' })
			.closest<HTMLElement>('[data-dragging]')!;
		expect(draggable).not.toHaveAttribute('data-no-dnd');
		await user.click(
			screen.getByText(type === 'Decision' ? 'Existing option' : 'Existing outcome'),
		);
		const name = screen.getByRole('textbox', { name: 'Name' });
		await user.tab();
		const utility = screen.getByRole('spinbutton', { name: 'Utility' });
		expect(utility).toHaveFocus();
		expect(utility).toBeEnabled();
		expect(utility.closest('[aria-disabled="true"]')).toBeNull();
		expect(requests).toHaveLength(0);
		expectControlOnlyDragBlocking(draggable);
		await user.click(name);
		await user.clear(name);
		await user.keyboard('{Enter}');
		expect(await screen.findByText(/name is required/)).toBeInTheDocument();
		expect(name.closest('[aria-disabled="true"]')).toBeNull();
		expectControlOnlyDragBlocking(draggable);
		await user.keyboard('{Escape}');
		expect(draggable).not.toHaveAttribute('data-no-dnd');
		await user.click(
			screen.getByText(type === 'Decision' ? 'Existing option' : 'Existing outcome'),
		);
		await user.type(screen.getByRole('textbox', { name: 'Name' }), ' changed{Enter}');
		await waitFor(() => expect(screen.queryByRole('textbox', { name: 'Name' })).toBeNull());
		expect(draggable).not.toHaveAttribute('data-no-dnd');
	},
);

test.each(['Decision', 'Uncertainty'] as const)(
	'%s rows expose accessible name and utility editing affordances on hover',
	async type => {
		savedIssue.type = type;
		const stateType = type === 'Decision' ? 'option' : 'outcome';
		const user = await renderBoard();
		await user.hover(screen.getByRole('listitem'));
		const editName = screen.getByRole('button', {
			name: `Edit ${stateType} name: Existing ${stateType}`,
		});
		const editUtility = screen.getByRole('button', {
			name: `Edit ${stateType} utility: Existing ${stateType}`,
		});
		expect(editName).toBeEnabled();
		await user.click(editUtility);
		expect(screen.getByRole('spinbutton', { name: 'Utility' })).toHaveFocus();
	},
);

test.each([
	['Decision', 'name'],
	['Decision', 'description'],
	['Uncertainty', 'name'],
	['Uncertainty', 'description'],
] as const)(
	'closing a %s state editor keeps only controls non-draggable while the issue %s editor remains active',
	async (type, field) => {
		savedIssue.type = type;
		const user = await renderBoard();
		const column = within(screen.getByRole('region', { name: `${type} issues` }));
		const draggable = column
			.getByRole('button', { name: 'Edit issue name: Existing issue' })
			.closest<HTMLElement>('[data-dragging]')!;
		await user.click(column.getByRole('button', { name: new RegExp(`^Edit issue ${field}:`) }));
		const text = column.getByRole('textbox', { name: `Issue ${field}` });
		await user.clear(text);
		await user.keyboard('{Enter}');
		expect(await column.findByText(`Issue ${field} is required`)).toBeInTheDocument();
		await user.click(
			column.getByText(type === 'Decision' ? 'Existing option' : 'Existing outcome'),
		);
		const stateName = column.getByRole('textbox', { name: 'Name' });
		expect(stateName).toHaveFocus();
		expect(text).toBeInTheDocument();
		expect(stateName.closest('[aria-disabled="true"]')).toBeNull();
		expect(text.closest('[aria-disabled="true"]')).toBeNull();
		expectControlOnlyDragBlocking(draggable);
		await user.keyboard('{Escape}');
		expect(column.queryByRole('textbox', { name: 'Name' })).toBeNull();
		expect(text).toHaveValue('');
		expect(text.closest('[aria-disabled="true"]')).toBeNull();
		expectControlOnlyDragBlocking(draggable);
		await user.click(text);
		await user.keyboard('{Escape}');
		expect(draggable).not.toHaveAttribute('data-no-dnd');
		expect(requests).toHaveLength(0);
	},
);

test.each([
	['Decision', 'name'],
	['Decision', 'description'],
	['Uncertainty', 'name'],
	['Uncertainty', 'description'],
] as const)(
	'closing the issue %s %s editor keeps only controls non-draggable while a state save is pending',
	async (type, field) => {
		savedIssue.type = type;
		let finish!: () => void;
		apiClient.defaults.adapter = async config => {
			const response = await adapter(config);
			if (config.method === 'put') {
				await new Promise<void>(resolve => {
					finish = resolve;
				});
			}
			return response;
		};
		const user = await renderBoard();
		const column = within(screen.getByRole('region', { name: `${type} issues` }));
		const draggable = column
			.getByRole('button', { name: 'Edit issue name: Existing issue' })
			.closest<HTMLElement>('[data-dragging]')!;
		await user.click(
			column.getByText(type === 'Decision' ? 'Existing option' : 'Existing outcome'),
		);
		const stateName = column.getByRole('textbox', { name: 'Name' });
		await user.clear(stateName);
		await user.type(stateName, 'Saved state{Enter}');
		await waitFor(() => expect(requests).toHaveLength(1));
		expect(stateName).toBeDisabled();
		await user.click(column.getByRole('button', { name: new RegExp(`^Edit issue ${field}:`) }));
		expect(column.getByRole('textbox', { name: `Issue ${field}` })).toHaveFocus();
		expect(stateName).toBeInTheDocument();
		expect(stateName.closest('[aria-disabled="true"]')).toBeNull();
		expect(
			column
				.getByRole('textbox', { name: `Issue ${field}` })
				.closest('[aria-disabled="true"]'),
		).toBeNull();
		expectControlOnlyDragBlocking(draggable);
		await user.keyboard('{Escape}');
		expect(column.queryByRole('textbox', { name: `Issue ${field}` })).toBeNull();
		expect(stateName).toBeDisabled();
		expect(stateName.closest('[aria-disabled="true"]')).toBeNull();
		expectControlOnlyDragBlocking(draggable);
		await act(async () => finish());
		await waitFor(() => expect(column.queryByRole('textbox', { name: 'Name' })).toBeNull());
		expect(draggable).not.toHaveAttribute('data-no-dnd');
		expect(column.getByText('Saved state')).toBeInTheDocument();
		expect(requests).toHaveLength(1);
	},
);

test.each([
	['Decision', 'cancel addition'],
	['Uncertainty', 'cancel addition'],
] as const)(
	'%s %s keeps only controls non-draggable while an invalid issue text editor remains active',
	async (type, operation) => {
		savedIssue.type = type;
		const stateType = type === 'Decision' ? 'option' : 'outcome';
		const user = await renderBoard();
		const column = within(screen.getByRole('region', { name: `${type} issues` }));
		const draggable = column
			.getByRole('button', { name: 'Edit issue name: Existing issue' })
			.closest<HTMLElement>('[data-dragging]')!;
		await user.click(column.getByRole('button', { name: 'Edit issue name: Existing issue' }));
		const issueName = column.getByRole('textbox', { name: 'Issue name' });
		await user.clear(issueName);
		await user.keyboard('{Enter}');
		if (operation === 'cancel addition') {
			await user.click(screen.getByRole('button', { name: `Add ${stateType}` }));
			await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Unsaved state');
			expect(
				screen.getByRole('textbox', { name: 'Name' }).closest('[aria-disabled="true"]'),
			).toBeNull();
			expectControlOnlyDragBlocking(draggable);
			await user.keyboard('{Escape}');
		} else {
			await user.click(screen.getByText(`Existing ${stateType}`));
			await user.click(screen.getByRole('button', { name: `Remove ${stateType}` }));
		}
		await waitFor(() => expect(column.queryByRole('textbox', { name: 'Name' })).toBeNull());
		expect(issueName).toHaveValue('');
		expect(issueName.closest('[aria-disabled="true"]')).toBeNull();
		expectControlOnlyDragBlocking(draggable);
		await user.click(issueName);
		await user.keyboard('{Escape}');
		expect(draggable).not.toHaveAttribute('data-no-dnd');
		expect(requests).toHaveLength(operation === 'cancel addition' ? 0 : 1);
	},
);

test.each(['Decision', 'Uncertainty'] as const)(
	'a %s state save queued behind issue text keeps both changes and untouched issue data',
	async type => {
		savedIssue.type = type;
		const original = structuredClone(savedIssue);
		let finish!: () => void;
		apiClient.defaults.adapter = async config => {
			const response = await adapter(config);
			if (config.method === 'put' && requests.length === 1) {
				await new Promise<void>(resolve => {
					finish = resolve;
				});
			}
			return response;
		};
		const user = await renderBoard();
		const column = within(screen.getByRole('region', { name: `${type} issues` }));
		await user.click(column.getByRole('button', { name: 'Edit issue name: Existing issue' }));
		await user.clear(column.getByRole('textbox', { name: 'Issue name' }));
		await user.type(
			column.getByRole('textbox', { name: 'Issue name' }),
			'Saved issue text{Enter}',
		);
		await waitFor(() => expect(requests).toHaveLength(1));
		await user.click(
			column.getByText(type === 'Decision' ? 'Existing option' : 'Existing outcome'),
		);
		await user.clear(column.getByRole('textbox', { name: 'Name' }));
		await user.type(column.getByRole('textbox', { name: 'Name' }), 'Saved state{Enter}');
		expect(column.getByRole('textbox', { name: 'Name' })).toBeDisabled();
		expect(requests).toHaveLength(1);
		await act(async () => finish());
		await waitFor(() => expect(requests).toHaveLength(2));
		expect(
			column.getByRole('button', { name: 'Edit issue name: Saved issue text' }),
		).toBeInTheDocument();
		expect(column.getByText('Saved state')).toBeInTheDocument();
		expect(requests[1]).toEqual(
			type === 'Decision'
				? {
						...original,
						name: 'Saved issue text',
						decision: {
							...original.decision,
							options: [{ ...original.decision.options[0], name: 'Saved state' }],
						},
					}
				: {
						...original,
						name: 'Saved issue text',
						uncertainty: {
							...original.uncertainty,
							outcomes: [
								{ ...original.uncertainty.outcomes[0], name: 'Saved state' },
							],
						},
					},
		);
	},
);

test.each(['Decision', 'Uncertainty'] as const)(
	'%s classification controls remain available during a pending state save',
	async type => {
		savedIssue.type = type;
		let finish!: () => void;
		apiClient.defaults.adapter = async config => {
			const response = await adapter(config);
			if (config.method === 'put') {
				await new Promise<void>(resolve => {
					finish = resolve;
				});
			}
			return response;
		};
		const user = await renderBoard();
		const column = within(screen.getByRole('region', { name: `${type} issues` }));
		await user.click(
			column.getByText(type === 'Decision' ? 'Existing option' : 'Existing outcome'),
		);
		await user.type(column.getByRole('textbox', { name: 'Name' }), ' updated{Enter}');
		await waitFor(() => expect(requests).toHaveLength(1));
		const controls = [
			column.getByRole('button', { name: `Issue type: ${type}` }),
			column.getByRole('button', { name: /^Boundary:/ }),
			column.getByRole('button', {
				name: type === 'Decision' ? /^Decision type:/ : 'Key uncertainty',
			}),
		];
		for (const control of controls) expect(control).toBeEnabled();
		await user.click(controls[0]);
		expect(screen.getByRole('menu', { name: 'ISSUE TYPE' })).toBeInTheDocument();
		await user.keyboard('{Escape}');
		expect(requests).toHaveLength(1);
		await act(async () => finish());
		await waitFor(() => {
			for (const control of controls) expect(control).toBeEnabled();
		});
		expect(requests).toHaveLength(1);
	},
);

test('Unassigned Board cards do not display stored states or state controls', async () => {
	savedIssue.type = 'Unassigned';
	await renderBoard(false);
	expect(screen.queryByText('Existing option')).toBeNull();
	expect(screen.queryByText('Existing outcome')).toBeNull();
	expect(screen.queryByRole('button', { name: /States$/ })).toBeNull();
	expect(screen.queryByRole('button', { name: /^Add (option|outcome)$/ })).toBeNull();
	expect(screen.queryByRole('textbox', { name: 'Name' })).toBeNull();
	expect(screen.queryByRole('button', { name: 'Edit option name: Existing option' })).toBeNull();
	expect(requests).toHaveLength(0);
	expect(savedIssue.decision.options).toHaveLength(1);
	expect(savedIssue.uncertainty.outcomes).toHaveLength(1);
});

test.each(['Decision', 'Uncertainty'] as const)(
	'a failed %s save loses the draft, restores the row, notifies and rejects double submits',
	async type => {
		addSecondState(type);
		let fail!: () => void;
		apiClient.defaults.adapter = async config => {
			if (config.method === 'put') {
				const [updated]: Issue[] = JSON.parse(config.data);
				requests.push(updated);
				await new Promise((_resolve, reject) => {
					fail = () => reject(new Error('Network unavailable'));
				});
			}
			return adapter(config);
		};
		const stateType = type === 'Decision' ? 'option' : 'outcome';
		const user = await renderBoard();
		await user.click(screen.getByText(`Existing ${stateType}`));
		await user.clear(screen.getByRole('textbox', { name: 'Name' }));
		await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Rejected draft{Enter}');
		await waitFor(() => expect(requests).toHaveLength(1));
		expect(screen.getByRole('textbox', { name: 'Name' })).toBeDisabled();
		expect(screen.getByRole('spinbutton', { name: 'Utility' })).toBeDisabled();
		await user.keyboard('{Enter}{Enter}');
		await user.click(screen.getByText(`Later ${stateType}`));
		expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Rejected draft');
		expect(requests).toHaveLength(1);
		await act(async () => fail());
		expect(await screen.findByText('Failed to update issue')).toBeInTheDocument();
		expect(screen.queryByRole('textbox', { name: 'Name' })).toBeNull();
		expect(screen.queryByText('Rejected draft')).toBeNull();
		expect(screen.getByText(`Existing ${stateType}`)).toBeInTheDocument();
		await user.click(screen.getByText(`Existing ${stateType}`));
		expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue(`Existing ${stateType}`);
		expect(screen.getByRole('spinbutton', { name: 'Utility' })).toHaveValue(
			type === 'Decision' ? 7 : -2,
		);
		expect(requests).toHaveLength(1);
	},
);

test.each(['Decision', 'Uncertainty'] as const)(
	'a delayed %s refresh cannot undo the first row when the next row is saved',
	async type => {
		addSecondState(type);
		let delayRefresh = false;
		const refreshes: (() => void)[] = [];
		apiClient.defaults.adapter = async config => {
			const response = await adapter(config);
			if (config.method === 'put') delayRefresh = true;
			if (config.method === 'get' && delayRefresh) {
				await new Promise<void>(resolve => refreshes.push(resolve));
			}
			return response;
		};
		const stateType = type === 'Decision' ? 'option' : 'outcome';
		const user = await renderBoard();
		await user.click(screen.getByText(`Existing ${stateType}`));
		await user.clear(screen.getByRole('textbox', { name: 'Name' }));
		await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Saved first');
		await user.click(screen.getByText(`Later ${stateType}`));
		await waitFor(() =>
			expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue(`Later ${stateType}`),
		);
		await user.clear(screen.getByRole('spinbutton', { name: 'Utility' }));
		await user.type(screen.getByRole('spinbutton', { name: 'Utility' }), '12{Enter}');
		await waitFor(() => expect(requests).toHaveLength(2));
		await act(async () => refreshes.forEach(finish => finish()));
		expect(await screen.findByText('Saved first')).toBeInTheDocument();
		expect(screen.getByText('12')).toBeInTheDocument();
	},
);

test.each(['Decision', 'Uncertainty'] as const)(
	'%s expansion stays open for an invalid row and collapses only after valid changes save',
	async type => {
		savedIssue.type = type;
		const user = await renderBoard();
		await user.click(
			screen.getByText(type === 'Decision' ? 'Existing option' : 'Existing outcome'),
		);
		await user.clear(screen.getByRole('textbox', { name: 'Name' }));
		await user.click(screen.getByRole('button', { name: '1 States' }));
		expect(screen.getByRole('textbox', { name: 'Name' })).toHaveFocus();
		expect(screen.getByRole('button', { name: '1 States' })).toHaveAttribute(
			'aria-expanded',
			'true',
		);
		expect(requests).toHaveLength(0);
		await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Saved before collapse');
		await user.click(screen.getByRole('button', { name: '1 States' }));
		await waitFor(() =>
			expect(screen.getByRole('button', { name: '1 States' })).toHaveAttribute(
				'aria-expanded',
				'false',
			),
		);
		expect(requests).toHaveLength(1);
		await user.click(screen.getByRole('button', { name: '1 States' }));
		expect(screen.getByText('Saved before collapse')).toBeInTheDocument();
		expect(screen.queryByRole('textbox', { name: 'Name' })).toBeNull();
	},
);

test.each(['Decision', 'Uncertainty'] as const)(
	'%s Board cards retain full Edit access without changing saved states',
	async type => {
		savedIssue.type = type;
		const user = await renderBoard();
		await user.click(screen.getByRole('button', { name: 'Issue actions' }));
		await user.click(await screen.findByRole('menuitem', { name: 'Edit' }));
		const dialog = screen.getByRole('dialog', { name: 'Edit Issue' });
		expect(within(dialog).getByRole('textbox', { name: 'Issue name' })).toHaveValue(
			savedIssue.name,
		);
		expect(
			within(dialog).getByRole('textbox', {
				name: type === 'Decision' ? 'Option 1' : 'Outcome 1 Name',
			}),
		).toHaveValue(type === 'Decision' ? 'Existing option' : 'Existing outcome');
		await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
		expect(requests).toHaveLength(0);
	},
);

test.each(['Decision', 'Uncertainty'] as const)(
	'non-Board %s cards retain their existing state selection instead of inline editing',
	async type => {
		savedIssue.type = type;
		const queryClient = new QueryClient({
			defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
		});
		const SharedCard = () => {
			const [selected, setSelected] = useState<string>();
			return (
				<>
					<IssueCard issue={savedIssue} onClickState={state => setSelected(state.name)}>
						<IssueCardContent />
						<IssueCardStates expandedProp />
					</IssueCard>
					<output aria-label='Selected state'>{selected}</output>
				</>
			);
		};
		render(
			<Provider>
				<QueryClientProvider client={queryClient}>
					<ProjectContext value={project}>
						<SharedCard />
					</ProjectContext>
				</QueryClientProvider>
			</Provider>,
		);
		const stateName = type === 'Decision' ? 'Existing option' : 'Existing outcome';
		await userEvent.setup().click(screen.getByText(stateName));
		expect(screen.getByRole('status', { name: 'Selected state' })).toHaveTextContent(stateName);
		expect(screen.queryByRole('textbox', { name: 'Name' })).toBeNull();
		expect(screen.queryByRole('button', { name: /^Add (option|outcome)$/ })).toBeNull();
		expect(screen.queryByRole('button', { name: /^Remove (option|outcome)$/ })).toBeNull();
		expect(requests).toHaveLength(0);
	},
);

test.each(['Decision', 'Uncertainty'] as const)(
	'a pending %s row save completes before the clicked next Utility is edited',
	async type => {
		addSecondState(type);
		let finish!: () => void;
		apiClient.defaults.adapter = async config => {
			const response = await adapter(config);
			if (config.method === 'put') {
				await new Promise<void>(resolve => {
					finish = resolve;
				});
			}
			return response;
		};
		const stateType = type === 'Decision' ? 'option' : 'outcome';
		const user = await renderBoard();
		await user.click(screen.getByText(`Existing ${stateType}`));
		await user.clear(screen.getByRole('textbox', { name: 'Name' }));
		await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Saved first');
		await user.click(
			screen.getByRole('button', {
				name: `Edit ${stateType} utility: Later ${stateType}`,
			}),
		);
		await waitFor(() => expect(requests).toHaveLength(1));
		expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Saved first');
		expect(screen.getByRole('spinbutton', { name: 'Utility' })).toBeDisabled();
		await act(async () => finish());
		await waitFor(() =>
			expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue(`Later ${stateType}`),
		);
		expect(screen.getByRole('spinbutton', { name: 'Utility' })).toHaveFocus();
		expect(screen.getByRole('spinbutton', { name: 'Utility' })).toHaveValue(3);
		expect(screen.getByText('Saved first')).toBeInTheDocument();
		await user.keyboard('{Escape}');
		expect(requests).toHaveLength(1);
	},
);

test.each(['Decision', 'Uncertainty'] as const)(
	'Tab cannot silently abandon an invalid %s row',
	async type => {
		addSecondState(type);
		const stateType = type === 'Decision' ? 'option' : 'outcome';
		const user = await renderBoard();
		await user.click(screen.getByText(`Existing ${stateType}`));
		await user.clear(screen.getByRole('textbox', { name: 'Name' }));
		await user.tab();
		await user.tab();
		expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('');
		expect(screen.getByRole('textbox', { name: 'Name' })).toHaveFocus();
		expect(await screen.findByText(/name is required/)).toBeInTheDocument();
		expect(screen.getByText(`Later ${stateType}`)).toBeInTheDocument();
		expect(requests).toHaveLength(0);
	},
);

test.each([
	['Decision', '', 'Option'],
	['Decision', '   ', 'Option'],
	['Uncertainty', '', 'Outcome'],
	['Uncertainty', '   ', 'Outcome'],
] as const)(
	'%s keeps a blank %s name editable with the shared %s validation on Enter and outside click',
	async (type, invalidName, stateType) => {
		savedIssue.type = type;
		const user = await renderBoard();
		await user.click(screen.getByText(`Existing ${stateType.toLowerCase()}`));
		const name = screen.getByRole('textbox', { name: 'Name' });
		await user.clear(name);
		if (invalidName) await user.type(name, invalidName);
		await user.keyboard('{Enter}');
		expect(await screen.findByText(`${stateType} name is required`)).toBeInTheDocument();
		expect(name).toHaveAttribute('aria-invalid', 'true');
		expect(name).toHaveFocus();
		await user.click(screen.getByRole('heading', { name: type }));
		expect(name).toHaveValue(invalidName);
		expect(name).toHaveFocus();
		expect(requests).toHaveLength(0);
		await user.clear(name);
		await user.type(name, 'Valid state{Enter}');
		expect(await screen.findByText('Valid state')).toBeInTheDocument();
		expect(screen.queryByText(`${stateType} name is required`)).toBeNull();
	},
);

test.each(['Decision', 'Uncertainty'] as const)(
	'Escape discards an invalid %s row draft and never sends a save',
	async type => {
		savedIssue.type = type;
		const user = await renderBoard();
		const stateName = type === 'Decision' ? 'Existing option' : 'Existing outcome';
		await user.click(screen.getByText(stateName));
		await user.clear(screen.getByRole('textbox', { name: 'Name' }));
		await user.type(screen.getByRole('spinbutton', { name: 'Utility' }), '9');
		await user.keyboard('{Enter}');
		expect(await screen.findByText(/name is required/)).toBeInTheDocument();
		await user.keyboard('{Escape}');
		expect(screen.queryByRole('textbox', { name: 'Name' })).toBeNull();
		expect(screen.queryByText(/name is required/)).toBeNull();
		expect(screen.getByText(stateName)).toBeInTheDocument();
		await user.click(screen.getByText(stateName));
		expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue(stateName);
		expect(screen.getByRole('spinbutton', { name: 'Utility' })).toHaveValue(
			type === 'Decision' ? 7 : -2,
		);
		expect(requests).toHaveLength(0);
	},
);
