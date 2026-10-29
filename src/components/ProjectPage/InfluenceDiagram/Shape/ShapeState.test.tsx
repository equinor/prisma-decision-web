import { QueryClient } from '@tanstack/react-query';
import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { apiClient } from '../../../../api';
import { RestrictionEntry } from '../../../../validators';
import {
	createDiagramFixture,
	diagramTransport,
	installDiagramDom,
	renderInfluenceDiagram,
} from '../__test__/diagramTestUtils';

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

const originalAdapter = apiClient.defaults.adapter;
let queryClient: QueryClient;
let fixture: ReturnType<typeof createDiagramFixture>;
let restoreDom: () => void;

beforeEach(() => {
	restoreDom = installDiagramDom();
	localStorage.clear();
	localStorage.setItem('influenceDiagramView', JSON.stringify('shape'));
	queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	fixture = createDiagramFixture();
	apiClient.interceptors.request.clear();
	apiClient.defaults.adapter = diagramTransport(fixture);
});

afterEach(() => {
	cleanup();
	queryClient.clear();
	apiClient.defaults.adapter = originalAdapter;
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
	restoreDom();
});

test('a Forced decision selects and clears an Option using the shared Scenario EV', async () => {
	const user = userEvent.setup();
	renderInfluenceDiagram(queryClient, fixture.project);
	const decision = await screen.findByTestId(`rf__node-${fixture.issues[0].node.id}`);
	const trigger = within(decision).getByRole('button', { name: 'Forced decision: Drill well' });
	expect(trigger).toHaveTextContent('1 state');
	await user.click(trigger);
	const states = within(decision).getByRole('list');
	await user.click(within(states).getByText('Existing option'));
	expect(trigger).toHaveTextContent('Existing option');
	expect(trigger).toHaveAttribute('aria-expanded', 'true');
	expect(states).toBeVisible();
	await user.unhover(trigger);
	expect(trigger).toBeVisible();
	await waitFor(() => {
		expect(screen.getByText('20.00')).toBeInTheDocument();
		expect(fixture.requests).toContainEqual(
			expect.objectContaining({
				method: 'post',
				url: expect.stringContaining('/with_evidence'),
				data: [
					{
						evidence_id: fixture.project.id,
						state_ids: [fixture.issues[0].decision.options[0].id],
						expected_utility: 0,
					},
				],
			}),
		);
	});
	const selected = within(states).getByRole('listitem');
	expect(selected).toHaveClass('outline-2');
	await user.click(selected);
	expect(states).toBeVisible();
	expect(trigger).toHaveTextContent('1 state');
	expect(await screen.findByText('Select states')).toBeInTheDocument();
});

test('Hard evidence and Forced decisions share their States and Scenario EV with Card view', async () => {
	const user = userEvent.setup();
	renderInfluenceDiagram(queryClient, fixture.project);
	const decision = await screen.findByTestId(`rf__node-${fixture.issues[0].node.id}`);
	const uncertainty = screen.getByTestId(`rf__node-${fixture.issues[1].node.id}`);
	const utility = screen.getByTestId(`rf__node-${fixture.issues[2].node.id}`);
	expect(
		within(utility).queryByRole('button', { name: /Forced decision|Hard evidence/ }),
	).toBeNull();
	await user.click(within(decision).getByRole('button', { name: 'Forced decision: Drill well' }));
	await user.click(within(decision).getByRole('listitem'));
	await user.click(within(uncertainty).getByRole('button', { name: 'Hard evidence: Oil price' }));
	await user.click(within(uncertainty).getByRole('listitem'));
	await waitFor(() =>
		expect(fixture.requests).toContainEqual(
			expect.objectContaining({
				method: 'post',
				url: expect.stringContaining('/with_evidence'),
				data: [
					{
						evidence_id: fixture.project.id,
						state_ids: [
							fixture.issues[0].decision.options[0].id,
							fixture.issues[1].uncertainty.outcomes[0].id,
						],
						expected_utility: 0,
					},
				],
			}),
		),
	);
	expect(screen.getByText('Scenario EV')).toBeVisible();
	expect(screen.getByText('20.00')).toBeVisible();
	await user.click(screen.getByRole('radio', { name: 'Card view' }));
	await user.click(await screen.findByRole('button', { name: 'Expand All' }));
	expect(await screen.findByText('Existing option')).toBeVisible();
	expect(screen.getByText('Existing outcome')).toBeVisible();
	expect(screen.getByText('20.00')).toBeVisible();
	fireEvent.click(screen.getByText('Existing outcome'));
	await user.click(screen.getByRole('radio', { name: 'Shape view' }));
	expect(
		await screen.findByRole('button', { name: 'Forced decision: Drill well' }),
	).toHaveTextContent('Existing option');
	expect(screen.getByRole('button', { name: 'Hard evidence: Oil price' })).toHaveTextContent(
		'1 state',
	);
	expect(screen.getByText('20.00')).toBeVisible();
	const shapeDecision = screen.getByTestId(`rf__node-${fixture.issues[0].node.id}`);
	await user.click(within(shapeDecision).getByRole('listitem'));
	expect(await screen.findByText('Select states')).toBeVisible();
	await user.click(screen.getByRole('radio', { name: 'Card view' }));
	expect(screen.getByText('Select states')).toBeVisible();
});

test.each(['Decision', 'Uncertainty'] as const)(
	'%s States follow creation order, disable fully restricted States, and replace the selected State',
	async type => {
		const source = fixture.issues[type === 'Decision' ? 0 : 1];
		const target = fixture.issues[type === 'Decision' ? 1 : 0];
		const label = type === 'Decision' ? 'Forced decision' : 'Hard evidence';
		const newStates = [
			{ name: 'Last created', created_at: '2026-10-03T00:00:00Z' },
			{ name: 'First created', created_at: '2026-10-01T00:00:00Z' },
			{ name: 'Second created', created_at: '2026-10-02T00:00:00Z' },
		];
		if (type === 'Decision') {
			source.decision.options = newStates.map(state => ({
				...source.decision.options[0],
				...state,
				id: crypto.randomUUID(),
			}));
			target.uncertainty.outcomes.push({
				...target.uncertainty.outcomes[0],
				id: crypto.randomUUID(),
				name: 'Second outcome',
			});
		} else {
			source.uncertainty.outcomes = newStates.map(state => ({
				...source.uncertainty.outcomes[0],
				...state,
				id: crypto.randomUUID(),
			}));
			target.decision.options.push({
				...target.decision.options[0],
				id: crypto.randomUUID(),
				name: 'Second option',
			});
		}
		const states = type === 'Decision' ? source.decision.options : source.uncertainty.outcomes;
		const children =
			type === 'Decision' ? target.uncertainty.outcomes : target.decision.options;
		const edge = {
			id: crypto.randomUUID(),
			project_id: fixture.project.id,
			tail_id: source.node.id,
			head_id: target.node.id,
		};
		fixture.edges.push(edge);
		fixture.probabilities =
			type === 'Decision'
				? states.flatMap(state =>
						children.map(child => ({
							...fixture.probabilities[0],
							id: crypto.randomUUID(),
							outcome_id: child.id,
							parent_option_ids: [state.id],
							probability: 0.5,
						})),
					)
				: states.map(state => ({
						...fixture.probabilities[0],
						id: crypto.randomUUID(),
						outcome_id: state.id,
						probability: 1 / 3,
					}));
		const tableId = crypto.randomUUID();
		fixture.restrictions.push({
			id: tableId,
			name: 'Allowed States',
			project_id: fixture.project.id,
			edge_id: edge.id,
			created_at: '2026-10-01T00:00:00Z',
			updated_at: '2026-10-01T00:00:00Z',
			restriction_entries: states.flatMap(state =>
				children.map((child, index) => ({
					id: crypto.randomUUID(),
					restriction_table_id: tableId,
					created_at: '2026-10-01T00:00:00Z',
					updated_at: '2026-10-01T00:00:00Z',
					parent_state_id: state.id,
					is_parent_uncertainty: type === 'Uncertainty',
					child_state_id: child.id,
					is_child_uncertainty: type === 'Decision',
					restriction_value:
						state.name === 'First created' ||
						(state.name === 'Second created' && index === 0)
							? 0
							: 1,
				})),
			),
		});
		const user = userEvent.setup();
		renderInfluenceDiagram(queryClient, fixture.project);
		const node = await screen.findByTestId(`rf__node-${source.node.id}`);
		const trigger = within(node).getByRole('button', { name: `${label}: ${source.name}` });
		await user.click(trigger);
		const picker = within(node).getByRole('list');
		expect(
			within(picker)
				.getAllByRole('listitem')
				.map(row => within(row).getAllByRole('paragraph')[0].textContent),
		).toEqual(['First created', 'Second created', 'Last created']);
		const restricted = within(picker).getAllByRole('listitem')[0];
		expect(restricted).toHaveClass('opacity-50');
		fireEvent.click(restricted);
		expect(picker).toBeVisible();
		expect(trigger).toHaveTextContent('3 states');
		await user.click(within(picker).getByText('Second created'));
		expect(trigger).toHaveTextContent('Second created');
		expect(picker).toBeVisible();
		await user.click(within(picker).getByText('Last created'));
		expect(trigger).toHaveTextContent('Last created');
		await waitFor(() =>
			expect(fixture.evaluations.at(-1)?.[0].state_ids).toEqual([states[0].id]),
		);
	},
);

test('State triggers toggle inline rows with the keyboard; outside interactions, menus, and Escape do not collapse them', async () => {
	const user = userEvent.setup();
	renderInfluenceDiagram(queryClient, fixture.project);
	const decision = await screen.findByTestId(`rf__node-${fixture.issues[0].node.id}`);
	const uncertainty = screen.getByTestId(`rf__node-${fixture.issues[1].node.id}`);
	const trigger = within(decision).getByRole('button', { name: 'Forced decision: Drill well' });
	await user.hover(decision);
	trigger.focus();
	await user.keyboard('{Enter}');
	const states = within(decision).getByRole('list');
	expect(states).toBeVisible();
	expect(trigger).toHaveFocus();
	await user.keyboard('{Escape}');
	expect(states).toBeVisible();
	expect(trigger).toHaveFocus();
	await user.keyboard(' ');
	expect(within(decision).queryByRole('list')).toBeNull();
	await user.keyboard('{Enter}');
	await user.click(within(decision).getByRole('listitem'));
	expect(trigger).toHaveTextContent('Existing option');

	await user.click(within(decision).getByRole('button', { name: 'Issue actions' }));
	expect(await screen.findByRole('menu', { name: 'Issue actions: Drill well' })).toBeVisible();
	expect(within(decision).getByRole('list')).toBeVisible();
	await user.click(within(uncertainty).getByRole('button', { name: 'Hard evidence: Oil price' }));
	expect(within(uncertainty).getByRole('list')).toBeVisible();
	expect(within(decision).getByRole('list')).toBeVisible();
	expect(screen.queryByRole('menu')).toBeNull();
	await user.click(screen.getByRole('radio', { name: 'Selection mode' }));
	await user.keyboard('{Escape}');
	expect(within(uncertainty).getByRole('list')).toBeVisible();
	expect(within(decision).getByRole('list')).toBeVisible();
	expect(trigger).toHaveTextContent('Existing option');
	await user.click(screen.getByRole('radio', { name: 'Card view' }));
	expect(screen.getAllByRole('list')).toHaveLength(2);
	await user.click(screen.getByRole('radio', { name: 'Shape view' }));
	expect(screen.getAllByRole('list')).toHaveLength(2);
	expect(
		await screen.findByRole('button', { name: 'Forced decision: Drill well' }),
	).toHaveTextContent('Existing option');
});

test.each([
	['Shape', 'Decision'],
	['Card', 'Decision'],
	['Shape', 'Uncertainty'],
	['Card', 'Uncertainty'],
] as const)(
	'%s view disables fully restricted child and parent %s States, but permits partial and missing restrictions',
	async (view, childType) => {
		localStorage.setItem('influenceDiagramView', JSON.stringify(view.toLowerCase()));
		const child = fixture.issues[childType === 'Decision' ? 0 : 1];
		const parent = fixture.issues[childType === 'Decision' ? 1 : 0];
		for (const issue of [parent, child]) {
			const states = ['Fully restricted', 'Partially restricted', 'Missing entry'].map(
				name => ({
					id: crypto.randomUUID(),
					name: `${issue.name} ${name}`,
				}),
			);
			if (issue.type === 'Decision')
				issue.decision.options = states.map(state => ({
					...issue.decision.options[0],
					...state,
				}));
			else
				issue.uncertainty.outcomes = states.map(state => ({
					...issue.uncertainty.outcomes[0],
					...state,
				}));
		}
		const parentStates =
			parent.type === 'Decision' ? parent.decision.options : parent.uncertainty.outcomes;
		const childStates =
			child.type === 'Decision' ? child.decision.options : child.uncertainty.outcomes;
		const edge = {
			id: crypto.randomUUID(),
			project_id: fixture.project.id,
			tail_id: parent.node.id,
			head_id: child.node.id,
		};
		fixture.edges.push(edge);
		const tableId = crypto.randomUUID();
		fixture.restrictions.push({
			id: tableId,
			name: 'State restrictions',
			project_id: fixture.project.id,
			edge_id: edge.id,
			created_at: '2026-10-21T00:00:00Z',
			updated_at: '2026-10-21T00:00:00Z',
			restriction_entries: parentStates.flatMap((parentState, row) =>
				childStates.flatMap((childState, column) =>
					row === 2 && column === 2
						? []
						: [
								{
									id: crypto.randomUUID(),
									restriction_table_id: tableId,
									created_at: '2026-10-21T00:00:00Z',
									updated_at: '2026-10-21T00:00:00Z',
									parent_state_id: parentState.id,
									child_state_id: childState.id,
									is_parent_uncertainty: parent.type === 'Uncertainty',
									is_child_uncertainty: child.type === 'Uncertainty',
									restriction_value: row === 1 && column === 1 ? 1 : 0,
								},
							],
				),
			),
		});
		const user = userEvent.setup();
		renderInfluenceDiagram(queryClient, fixture.project);
		await screen.findByTestId(`rf__node-${child.node.id}`);
		if (view === 'Card') await user.click(screen.getByRole('button', { name: 'Expand All' }));
		for (const issue of [child, parent]) {
			const node = screen.getByTestId(`rf__node-${issue.node.id}`);
			const states =
				issue.type === 'Decision' ? issue.decision.options : issue.uncertainty.outcomes;
			const label = issue.type === 'Decision' ? 'Forced decision' : 'Hard evidence';
			if (view === 'Shape') {
				await user.click(
					within(node).getByRole('button', { name: `${label}: ${issue.name}` }),
				);
			}
			for (const [index, state] of states.entries()) {
				const row = within(within(node).getByRole('list')).getByText(state.name);
				fireEvent.click(row);
				if (index === 0) {
					expect(screen.getByText('Select states')).toBeVisible();
					continue;
				}
				await waitFor(() =>
					expect(fixture.evaluations.at(-1)?.[0].state_ids).toEqual([state.id]),
				);
				expect(await screen.findByText('20.00')).toBeVisible();
				fireEvent.click(row);
				expect(await screen.findByText('Select states')).toBeVisible();
			}
		}
	},
);

test.each(['Shape', 'Card'])(
	'%s view can clear a selected child State after the Restriction Table excludes it',
	async view => {
		localStorage.setItem('influenceDiagramView', JSON.stringify(view.toLowerCase()));
		const [parent, child] = fixture.issues;
		const edge = {
			id: crypto.randomUUID(),
			project_id: fixture.project.id,
			tail_id: parent.node.id,
			head_id: child.node.id,
		};
		fixture.edges.push(edge);
		const tableId = crypto.randomUUID();
		fixture.restrictions.push({
			id: tableId,
			name: 'State restrictions',
			project_id: fixture.project.id,
			edge_id: edge.id,
			created_at: '2026-10-21T00:00:00Z',
			updated_at: '2026-10-21T00:00:00Z',
			restriction_entries: [
				{
					id: crypto.randomUUID(),
					restriction_table_id: tableId,
					created_at: '2026-10-21T00:00:00Z',
					updated_at: '2026-10-21T00:00:00Z',
					parent_state_id: parent.decision.options[0].id,
					child_state_id: child.uncertainty.outcomes[0].id,
					is_parent_uncertainty: false,
					is_child_uncertainty: true,
					restriction_value: 1,
				},
			],
		});
		const transport = diagramTransport(fixture);
		apiClient.defaults.adapter = async config => {
			if (config.url === '/restriction_entries' && config.method === 'put') {
				const updates: RestrictionEntry[] = JSON.parse(config.data);
				fixture.restrictions[0].restriction_entries = updates;
				const response = await transport(config);
				return { ...response, data: updates };
			}
			return transport(config);
		};
		const user = userEvent.setup();
		renderInfluenceDiagram(queryClient, fixture.project);
		const node = await screen.findByTestId(`rf__node-${fixture.issues[1].node.id}`);
		if (view === 'Shape') {
			await user.click(
				within(node).getByRole('button', { name: 'Hard evidence: Oil price' }),
			);
		} else {
			await user.click(screen.getByRole('button', { name: 'Expand All' }));
		}
		fireEvent.click(within(node).getByRole('listitem'));
		expect(await screen.findByText('20.00')).toBeVisible();
		const arc = screen.getByRole('group', {
			name: `Edge from ${parent.node.id} to ${child.node.id}`,
		});
		await user.hover(arc);
		const actions = await within(screen.getByRole('application')).findByRole('button', {
			name: '',
		});
		await user.click(actions);
		const restriction = await screen.findByRole('switch', {
			name: 'Existing option allows Existing outcome',
		});
		await user.click(restriction);
		await waitFor(() =>
			expect(fixture.requests).toContainEqual(
				expect.objectContaining({
					method: 'put',
					url: '/restriction_entries',
					data: [expect.objectContaining({ restriction_value: 0 })],
				}),
			),
		);
		await user.click(actions);
		const selected = within(node).getByRole('listitem');
		expect(selected).toHaveClass('outline-2');
		expect(selected).not.toHaveClass('opacity-50');
		fireEvent.click(selected);
		expect(await screen.findByText('Select states')).toBeVisible();
		expect(selected).toHaveClass('opacity-50');
		fireEvent.click(selected);
		expect(await screen.findByText('Select states')).toBeVisible();
	},
);
