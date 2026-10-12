import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosAdapter } from 'axios';
import { Provider } from 'jotai';
import { useState } from 'react';
import { Toaster, toast } from 'sonner';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { apiClient } from '../../../../api';
import { existingIssue, project } from '../../../../test/issueFixtures';
import { Issue } from '../../../../validators';
import { ProjectContext } from '../../ProjectContext';
import { IssueCard, IssueCardContent, IssueCardStates } from '../../../common/Cards/IssueCard';
import { TableView } from './TableView';

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

const renderBoard = async () => {
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
	await user.click(await screen.findByRole('button', { name: /^\d+ States$/ }));
	return user;
};

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
	'%s cards cannot be dragged while a row editor is active, including an invalid row',
	async type => {
		savedIssue.type = type;
		const user = await renderBoard();
		const draggable = screen
			.getAllByRole('button')
			.find(button => button.getAttribute('aria-roledescription') === 'draggable');
		expect(draggable).toHaveAttribute('aria-disabled', 'false');
		await user.click(
			screen.getByText(type === 'Decision' ? 'Existing option' : 'Existing outcome'),
		);
		await waitFor(() => expect(draggable).toHaveAttribute('aria-disabled', 'true'));
		await user.clear(screen.getByRole('textbox', { name: 'Name' }));
		await user.keyboard('{Enter}');
		expect(await screen.findByText(/name is required/)).toBeInTheDocument();
		expect(draggable).toHaveAttribute('aria-disabled', 'true');
		await user.keyboard('{Escape}');
		await waitFor(() => expect(draggable).toHaveAttribute('aria-disabled', 'false'));
		await user.click(
			screen.getByText(type === 'Decision' ? 'Existing option' : 'Existing outcome'),
		);
		await user.type(screen.getByRole('textbox', { name: 'Name' }), ' changed{Enter}');
		await waitFor(() => expect(draggable).toHaveAttribute('aria-disabled', 'false'));
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
	'closing a %s state editor keeps dragging disabled while the issue %s editor remains active',
	async (type, field) => {
		savedIssue.type = type;
		const user = await renderBoard();
		const column = within(screen.getByRole('region', { name: `${type} issues` }));
		const draggable = column
			.getAllByRole('button')
			.find(button => button.getAttribute('aria-roledescription') === 'draggable');
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
		expect(draggable).toHaveAttribute('aria-disabled', 'true');
		await user.keyboard('{Escape}');
		expect(column.queryByRole('textbox', { name: 'Name' })).toBeNull();
		expect(text).toHaveValue('');
		expect(draggable).toHaveAttribute('aria-disabled', 'true');
		await user.click(text);
		await user.keyboard('{Escape}');
		await waitFor(() => expect(draggable).toHaveAttribute('aria-disabled', 'false'));
		expect(requests).toHaveLength(0);
	},
);

test.each([
	['Decision', 'name'],
	['Decision', 'description'],
	['Uncertainty', 'name'],
	['Uncertainty', 'description'],
] as const)(
	'closing the issue %s %s editor keeps dragging disabled while a state save is pending',
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
			.getAllByRole('button')
			.find(button => button.getAttribute('aria-roledescription') === 'draggable');
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
		expect(draggable).toHaveAttribute('aria-disabled', 'true');
		await user.keyboard('{Escape}');
		expect(column.queryByRole('textbox', { name: `Issue ${field}` })).toBeNull();
		expect(stateName).toBeDisabled();
		expect(draggable).toHaveAttribute('aria-disabled', 'true');
		await act(async () => finish());
		await waitFor(() => expect(draggable).toHaveAttribute('aria-disabled', 'false'));
		expect(column.getByText('Saved state')).toBeInTheDocument();
		expect(requests).toHaveLength(1);
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
	'%s classification controls cannot overwrite a pending state save',
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
		for (const control of controls) expect(control).toBeDisabled();
		await act(async () => finish());
		await waitFor(() => {
			for (const control of controls) expect(control).toBeEnabled();
		});
		expect(requests).toHaveLength(1);
	},
);

test('Unassigned Board cards retain read-only stored states and their existing expansion', async () => {
	savedIssue.type = 'Unassigned';
	const user = await renderBoard();
	await user.click(screen.getByText('Existing option'));
	expect(screen.queryByRole('textbox', { name: 'Name' })).toBeNull();
	expect(screen.queryByRole('button', { name: 'Edit option name: Existing option' })).toBeNull();
	expect(requests).toHaveLength(0);
	await user.click(screen.getByRole('button', { name: '1 States' }));
	expect(screen.queryByText('Existing option')).toBeNull();
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
