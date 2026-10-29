import { QueryClient } from '@tanstack/react-query';
import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosAdapter, AxiosError } from 'axios';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { apiClient } from '../../../../api';
import { DiscreteProbability, DiscreteUtility } from '../../../../validators';
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
let utilities: DiscreteUtility[];
let restoreDom: () => void;
let tableTransport: AxiosAdapter;

beforeEach(() => {
	restoreDom = installDiagramDom();
	localStorage.clear();
	localStorage.setItem('influenceDiagramView', JSON.stringify('shape'));
	queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	fixture = createDiagramFixture();
	utilities = [
		{
			id: crypto.randomUUID(),
			project_id: fixture.project.id,
			utility_id: fixture.issues[2].utility.id,
			value_metric_id: fixture.issues[2].value_metric?.id ?? crypto.randomUUID(),
			parent_option_ids: [fixture.issues[0].decision.options[0].id],
			parent_outcome_ids: [fixture.issues[1].uncertainty.outcomes[0].id],
			utility_value: 85,
		},
	];
	apiClient.interceptors.request.clear();
	const transport = diagramTransport(fixture);
	tableTransport = async config => {
		if (config.method === 'put' && config.url === '/discrete_probabilities') {
			const updates: DiscreteProbability[] = JSON.parse(config.data);
			fixture.probabilities = fixture.probabilities.map(
				probability => updates.find(update => update.id === probability.id) ?? probability,
			);
		}
		if (config.method === 'put' && config.url === '/discrete_utilities') {
			const updates: DiscreteUtility[] = JSON.parse(config.data);
			utilities = utilities.map(
				utility => updates.find(update => update.id === utility.id) ?? utility,
			);
		}
		const response = await transport(config);
		if (config.url === '/discrete_utilities') response.data = structuredClone(utilities);
		if (config.url?.endsWith('/policy_table')) {
			response.data = [
				{
					decision_id: fixture.issues[0].id,
					option_id: fixture.issues[0].decision.options[0].id,
					parent_state_ids: [],
					value: 1,
				},
			];
		}
		return response;
	};
	apiClient.defaults.adapter = tableTransport;
});

test('Probability tables retain blur saving, row validation, and the same saved values in Card view', async () => {
	const savedProbability = { ...fixture.probabilities[0], probability: 0.6 };
	const user = userEvent.setup();
	renderInfluenceDiagram(queryClient, fixture.project);
	const uncertainty = await screen.findByTestId(`rf__node-${fixture.issues[1].node.id}`);
	await user.click(within(uncertainty).getByRole('button', { name: 'Probability table' }));
	const table = uncertainty;
	const value = await within(table).findByRole('spinbutton');
	expect(value).toHaveValue(1);
	expect(within(table).getByRole('columnheader', { name: /Existing outcome/ })).toBeVisible();
	await user.clear(value);
	await user.type(value, '0.6');
	await user.click(within(table).getByRole('heading', { name: 'Oil price Probability Table' }));
	await waitFor(() =>
		expect(fixture.requests).toContainEqual({
			method: 'put',
			url: '/discrete_probabilities',
			data: [savedProbability],
		}),
	);
	expect(await within(table).findByRole('cell', { name: '∑≠1' })).toBeVisible();
	await user.keyboard('{Escape}');
	await user.click(screen.getByRole('radio', { name: 'Card view' }));
	const card = await screen.findByTestId(`rf__node-${fixture.issues[1].node.id}`);
	within(card).getByRole('button', { name: 'Issue actions' }).focus();
	await user.keyboard('{Enter}');
	await user.click(await screen.findByRole('menuitem', { name: 'Probabilities' }));
	expect(await within(card).findByRole('spinbutton')).toHaveValue(0.6);
});

test('Escape does not close an inline Probability table; its close button preserves the saved edit', async () => {
	const user = userEvent.setup();
	renderInfluenceDiagram(queryClient, fixture.project);
	const uncertainty = await screen.findByTestId(`rf__node-${fixture.issues[1].node.id}`);
	const trigger = within(uncertainty).getByRole('button', { name: 'Probability table' });
	await user.click(trigger);
	const table = uncertainty;
	const value = await within(table).findByRole('spinbutton');
	await user.clear(value);
	await user.type(value, '0.6');
	await user.click(within(table).getByRole('heading', { name: 'Oil price Probability Table' }));
	expect(await within(table).findByRole('cell', { name: '∑≠1' })).toBeVisible();
	const savedInput = within(table).getByRole('spinbutton');
	await user.click(savedInput);
	expect(savedInput).toHaveFocus();
	await user.keyboard('{Escape}');
	expect(within(table).getByRole('spinbutton')).toBeVisible();
	expect(trigger).toHaveAttribute('aria-expanded', 'true');
	await user.click(within(table).getByRole('button', { name: '' }));
	expect(within(table).queryByRole('spinbutton')).toBeNull();
	expect(trigger).toHaveAttribute('aria-expanded', 'false');
	await waitFor(() =>
		expect(fixture.requests).toContainEqual({
			method: 'put',
			url: '/discrete_probabilities',
			data: [{ ...fixture.probabilities[0], probability: 0.6 }],
		}),
	);
	await user.click(trigger);
	expect(await within(table).findByRole('spinbutton')).toHaveValue(0.6);
	expect(within(table).getByRole('cell', { name: '∑≠1' })).toBeVisible();
});

afterEach(() => {
	cleanup();
	queryClient.clear();
	apiClient.defaults.adapter = originalAdapter;
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
	restoreDom();
});

test('a Decision table trigger opens the existing solver Policy table', async () => {
	const user = userEvent.setup();
	renderInfluenceDiagram(queryClient, fixture.project);
	const decision = await screen.findByTestId(`rf__node-${fixture.issues[0].node.id}`);
	await user.hover(within(decision).getByText('Drill well'));
	const trigger = within(decision).getByRole('button', { name: 'Policy table' });
	await user.click(trigger);
	const table = decision;
	expect(within(table).getByRole('heading', { name: 'Drill well Policy Table' })).toBeVisible();
	expect(
		await within(table).findByRole('columnheader', { name: /Existing option/ }),
	).toBeVisible();
	expect(within(table).getByRole('cell', { name: '1' })).toBeVisible();
	expect(within(table).queryByRole('spinbutton')).toBeNull();
	await user.click(trigger);
	expect(within(table).queryByRole('heading', { name: 'Drill well Policy Table' })).toBeNull();
	expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test.each([0, 1])(
	'a Utility with %i parents cannot open its table and explains why',
	async count => {
		fixture.edges = fixture.edges.slice(0, count);
		const user = userEvent.setup();
		renderInfluenceDiagram(queryClient, fixture.project);
		const utility = await screen.findByTestId(`rf__node-${fixture.issues[2].node.id}`);
		await user.hover(within(utility).getByText('NPV'));
		const trigger = within(utility).getByRole('button', { name: 'Utility table' });
		expect(trigger).toBeDisabled();
		fireEvent.click(trigger);
		expect(within(utility).queryByRole('heading', { name: 'NPV Utility Table' })).toBeNull();
		await user.hover(within(utility).getByRole('img', { name: 'Warning: NPV' }));
		expect(await screen.findByRole('tooltip')).toHaveTextContent(
			'Connect 2+ parent nodes to enable utility table and solver',
		);
	},
);

test('an eligible Utility table retains its parent rows, blur saving, and Reset all', async () => {
	const savedUtility = { ...utilities[0], utility_value: 90 };
	const user = userEvent.setup();
	renderInfluenceDiagram(queryClient, fixture.project);
	const utility = await screen.findByTestId(`rf__node-${fixture.issues[2].node.id}`);
	const trigger = within(utility).getByRole('button', { name: 'Utility table' });
	expect(trigger).toBeEnabled();
	await user.click(trigger);
	const table = utility;
	expect(await within(table).findByRole('cell', { name: 'Existing option' })).toBeVisible();
	expect(within(table).getByRole('cell', { name: 'Existing outcome' })).toBeVisible();
	const value = within(table).getByRole('spinbutton');
	expect(value).toHaveValue(85);
	await user.clear(value);
	await user.type(value, '90');
	await user.click(within(table).getByRole('heading', { name: 'NPV Utility Table' }));
	await waitFor(() =>
		expect(fixture.requests).toContainEqual({
			method: 'put',
			url: '/discrete_utilities',
			data: [savedUtility],
		}),
	);
	await user.click(within(table).getByRole('button', { name: 'Reset all' }));
	await waitFor(() =>
		expect(fixture.requests).toContainEqual({
			method: 'put',
			url: '/discrete_utilities',
			data: [{ ...savedUtility, utility_value: 0 }],
		}),
	);
	await waitFor(() => expect(within(table).getByRole('spinbutton')).toHaveValue(0));
	expect(within(table).getByRole('button', { name: 'Reset all' })).toBeDisabled();
});

test('Probability Reset all keeps the existing bulk-saving behavior', async () => {
	const user = userEvent.setup();
	renderInfluenceDiagram(queryClient, fixture.project);
	const uncertainty = await screen.findByTestId(`rf__node-${fixture.issues[1].node.id}`);
	await user.click(within(uncertainty).getByRole('button', { name: 'Probability table' }));
	const table = uncertainty;
	await user.click(within(table).getByRole('button', { name: 'Reset all' }));
	await waitFor(() =>
		expect(fixture.requests).toContainEqual({
			method: 'put',
			url: '/discrete_probabilities',
			data: [expect.objectContaining({ id: fixture.probabilities[0].id, probability: 0 })],
		}),
	);
	await waitFor(() => expect(within(table).getByRole('spinbutton')).toHaveValue(0));
	expect(within(table).getByRole('button', { name: 'Reset all' })).toBeDisabled();
});

test.each([
	['Uncertainty: Oil price', 'Probability table', '/discrete_probabilities', 'probabilities', 1],
	['Utility: NPV', 'Utility table', '/discrete_utilities', 'utilities', 85],
] as const)(
	'a failed %s table save reports the existing error and does not persist the edited value',
	async (nodeName, triggerName, endpoint, errorName, originalValue) => {
		apiClient.defaults.adapter = async config => {
			if (config.method === 'put' && config.url === endpoint) {
				fixture.requests.push({
					method: config.method,
					url: config.url,
					data: JSON.parse(config.data),
				});
				throw new AxiosError('Service unavailable', 'ERR_NETWORK', config);
			}
			return tableTransport(config);
		};
		const user = userEvent.setup();
		renderInfluenceDiagram(queryClient, fixture.project);
		const node = await screen.findByTestId(
			`rf__node-${fixture.issues[nodeName === 'Uncertainty: Oil price' ? 1 : 2].node.id}`,
		);
		const trigger = within(node).getByRole('button', { name: triggerName });
		await user.click(trigger);
		const table = node;
		const value = await within(table).findByRole('spinbutton');
		await user.clear(value);
		await user.type(value, '0.7');
		await user.click(within(table).getByRole('heading'));
		expect(await screen.findByText(`Failed to update ${errorName}`)).toBeVisible();
		expect(fixture.requests).toContainEqual(
			expect.objectContaining({ method: 'put', url: endpoint }),
		);
		await user.click(trigger);
		expect(within(table).queryByRole('spinbutton')).toBeNull();
		await user.click(trigger);
		expect(await screen.findByRole('spinbutton')).toHaveValue(originalValue);
	},
);

test('inline tables can coexist, stay open on outside click and Escape, and close through their existing controls', async () => {
	const user = userEvent.setup();
	renderInfluenceDiagram(queryClient, fixture.project);
	const decision = await screen.findByTestId(`rf__node-${fixture.issues[0].node.id}`);
	const uncertainty = screen.getByTestId(`rf__node-${fixture.issues[1].node.id}`);
	const utility = screen.getByTestId(`rf__node-${fixture.issues[2].node.id}`);
	const policyTrigger = within(decision).getByRole('button', { name: 'Policy table' });
	policyTrigger.focus();
	await user.keyboard('{Enter}');
	expect(
		within(decision).getByRole('heading', { name: 'Drill well Policy Table' }),
	).toBeVisible();
	expect(policyTrigger).toHaveFocus();
	await user.click(within(uncertainty).getByRole('button', { name: 'Probability table' }));
	const utilityTrigger = within(utility).getByRole('button', { name: 'Utility table' });
	await user.click(utilityTrigger);
	await user.click(screen.getByRole('radio', { name: 'Selection mode' }));
	await user.keyboard('{Escape}');
	for (const [node, name] of [
		[decision, 'Drill well Policy Table'],
		[uncertainty, 'Oil price Probability Table'],
		[utility, 'NPV Utility Table'],
	] as const) {
		expect(within(node).getByRole('heading', { name })).toBeVisible();
	}
	expect(screen.queryByRole('dialog')).toBeNull();
	await user.click(within(utility).getByRole('button', { name: '' }));
	expect(within(utility).queryByRole('heading', { name: 'NPV Utility Table' })).toBeNull();
	expect(utilityTrigger).toHaveAttribute('aria-expanded', 'false');
	await user.click(policyTrigger);
	expect(within(decision).queryByRole('heading', { name: 'Drill well Policy Table' })).toBeNull();
	expect(
		within(uncertainty).getByRole('heading', { name: 'Oil price Probability Table' }),
	).toBeVisible();
	await user.click(screen.getByRole('radio', { name: 'Card view' }));
	expect(screen.queryByRole('heading', { name: 'Oil price Probability Table' })).toBeNull();
	await user.click(screen.getByRole('radio', { name: 'Shape view' }));
	expect(screen.queryByRole('heading', { name: 'Oil price Probability Table' })).toBeNull();
});

test('inline tables preserve expanded States and Card-selected Scenario overrides without altering Scenario EV', async () => {
	localStorage.setItem('influenceDiagramView', JSON.stringify('card'));
	fixture.issues[0].description = 'Decide whether to develop the well.';
	fixture.issues[1].description = 'Market conditions for the project.';
	const user = userEvent.setup();
	renderInfluenceDiagram(queryClient, fixture.project);
	await user.click(await screen.findByRole('button', { name: 'Expand All' }));
	fireEvent.click(await screen.findByText('Existing option'));
	fireEvent.click(screen.getByText('Existing outcome'));
	await waitFor(() => expect(screen.getByText('20.00')).toBeVisible());
	await user.click(screen.getByRole('radio', { name: 'Shape view' }));
	const nodes = [
		[
			fixture.issues[0].node.id,
			'Policy table',
			'Forced decision: Drill well',
			'Existing option',
		],
		[
			fixture.issues[1].node.id,
			'Probability table',
			'Hard evidence: Oil price',
			'Existing outcome',
		],
	] as const;
	for (const [nodeId, triggerName, stateLabel, selectedState] of nodes) {
		const node = await screen.findByTestId(`rf__node-${nodeId}`);
		expect(within(node).getByRole('button', { name: stateLabel })).toBeVisible();
		expect(within(node).getByRole('button', { name: stateLabel })).toHaveTextContent(
			selectedState,
		);
		expect(within(within(node).getByRole('list')).getByText(selectedState)).toBeVisible();
		await user.click(within(node).getByRole('button', { name: triggerName }));
		expect(within(node).getByRole('heading', { name: /Table$/ })).toBeVisible();
		expect(within(within(node).getByRole('list')).getByText(selectedState)).toBeVisible();
		expect(within(node).getByRole('button', { name: stateLabel })).toBeVisible();
		expect(within(node).getByRole('button', { name: stateLabel })).toHaveTextContent(
			selectedState,
		);
		expect(screen.getByText('20.00')).toBeVisible();
		const stateTrigger = within(node).getByRole('button', { name: stateLabel });
		await user.click(stateTrigger);
		expect(stateTrigger).toHaveAttribute('aria-expanded', 'false');
		expect(within(node).queryByRole('list')).toBeNull();
		expect(within(node).getByRole('heading', { name: /Table$/ })).toBeVisible();
		await user.click(stateTrigger);
		expect(stateTrigger).toHaveAttribute('aria-expanded', 'true');
		expect(within(node).getByRole('list')).toBeVisible();
		await user.click(within(node).getByRole('button', { name: triggerName }));
		expect(within(node).queryByRole('heading', { name: /Table$/ })).toBeNull();
		expect(within(node).getByRole('list')).toBeVisible();
	}
	await user.click(screen.getByRole('radio', { name: 'Card view' }));
	fireEvent.click(await screen.findByText('Existing option'));
	fireEvent.click(screen.getByText('Existing outcome'));
	expect(await screen.findByText('Select states')).toBeVisible();
});
