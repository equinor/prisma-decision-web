import { QueryClient } from '@tanstack/react-query';
import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { apiClient } from '../../../api';
import {
	createDiagramFixture,
	diagramIssue,
	diagramTransport,
	installDiagramDom,
	renderInfluenceDiagram,
} from './__test__/diagramTestUtils';

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
	queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	fixture = createDiagramFixture();
	apiClient.interceptors.request.clear();
	apiClient.defaults.adapter = diagramTransport(fixture);
});

test('Shape view and Card view present the same eligible Issues without Card-only expansion controls', async () => {
	fixture.issues[1].boundary = 'on';
	fixture.issues[2].boundary = 'on';
	fixture.issues.push(
		diagramIssue('Fact outside diagram', 'Fact'),
		diagramIssue('Unassigned outside diagram', 'Unassigned'),
		{ ...diagramIssue('Outside boundary', 'Decision'), boundary: 'out' },
	);
	const tactical = diagramIssue('Tactical decision', 'Decision');
	tactical.decision.type = 'Tactical';
	fixture.issues.push(tactical);
	const nonKey = diagramIssue('Non-key uncertainty', 'Uncertainty');
	nonKey.uncertainty.is_key = false;
	fixture.issues.push(nonKey);
	const excludedEdge = {
		...fixture.edges[0],
		id: crypto.randomUUID(),
		tail_id: fixture.issues[3].node.id,
	};
	fixture.edges.push(excludedEdge);
	const user = userEvent.setup();
	renderDiagram();
	expect(await screen.findByText('Drill well')).toBeInTheDocument();
	expect(await screen.findByText('Oil price')).toBeInTheDocument();
	expect(await screen.findByText('NPV')).toBeInTheDocument();
	for (const edge of fixture.edges.slice(0, 2)) {
		expect(
			await screen.findByRole('group', {
				name: `Edge from ${edge.tail_id} to ${edge.head_id}`,
			}),
		).toBeInTheDocument();
	}
	await user.click(screen.getByRole('radio', { name: 'Shape view' }));
	expect(await screen.findByTestId(`rf__node-${fixture.issues[0].node.id}`)).toBeInTheDocument();
	expect(screen.getByTestId(`rf__node-${fixture.issues[1].node.id}`)).toBeInTheDocument();
	expect(screen.getByTestId(`rf__node-${fixture.issues[2].node.id}`)).toBeInTheDocument();
	expect(screen.queryByRole('button', { name: 'Expand All' })).toBeNull();
	for (const edge of fixture.edges.slice(0, 2)) {
		expect(
			screen.getByRole('group', { name: `Edge from ${edge.tail_id} to ${edge.head_id}` }),
		).toBeInTheDocument();
	}
	expect(
		screen.queryByRole('group', {
			name: `Edge from ${excludedEdge.tail_id} to ${excludedEdge.head_id}`,
		}),
	).toBeNull();
	for (const name of [
		'Fact outside diagram',
		'Unassigned outside diagram',
		'Outside boundary',
		'Tactical decision',
		'Non-key uncertainty',
	]) {
		expect(screen.queryByText(name)).toBeNull();
	}
	await user.click(screen.getByRole('radio', { name: 'Card view' }));
	expect(await screen.findByRole('button', { name: 'Expand All' })).toBeInTheDocument();
	expect(screen.getByText('Drill well')).toBeInTheDocument();
});

afterEach(() => {
	cleanup();
	queryClient.clear();
	apiClient.defaults.adapter = originalAdapter;
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
	restoreDom();
});

const renderDiagram = () => renderInfluenceDiagram(queryClient, fixture.project);

test('Card view is the initial default and choosing Shape view survives remounting and changing projects', async () => {
	const user = userEvent.setup();
	const diagram = renderDiagram();
	expect(await screen.findByRole('radio', { name: 'Card view' })).toBeChecked();
	await user.click(screen.getByRole('radio', { name: 'Shape view' }));
	expect(screen.getByRole('radio', { name: 'Shape view' })).toBeChecked();
	diagram.unmount();
	const reloaded = renderDiagram();
	expect(await screen.findByRole('radio', { name: 'Shape view' })).toBeChecked();
	reloaded.unmount();
	queryClient.clear();
	fixture = createDiagramFixture({ ...fixture.project, id: crypto.randomUUID() });
	apiClient.defaults.adapter = diagramTransport(fixture);
	renderDiagram();
	expect(await screen.findByRole('radio', { name: 'Shape view' })).toBeChecked();
	expect(await screen.findByTestId(`rf__node-${fixture.issues[0].node.id}`)).toBeInTheDocument();
	expect(
		fixture.requests.filter(
			request => request.method !== 'get' && !request.url?.includes('/with_evidence'),
		),
	).toHaveLength(0);
});

test('Scenario overrides and their EV effect are shared between Cards and Shape State triggers', async () => {
	const user = userEvent.setup();
	renderDiagram();
	await user.click(await screen.findByRole('button', { name: 'Expand All' }));
	fireEvent.click(await screen.findByText('Existing option'));
	fireEvent.click(screen.getByText('Existing outcome'));
	await waitFor(() => {
		expect(screen.getByText('20.00')).toBeInTheDocument();
		expect(fixture.evaluations.some(request => request[0].state_ids.length === 2)).toBe(true);
	});

	await user.click(screen.getByRole('radio', { name: 'Shape view' }));
	expect(
		await screen.findByRole('button', { name: 'Forced decision: Drill well' }),
	).toHaveTextContent('Existing option');
	expect(screen.getByRole('button', { name: 'Hard evidence: Oil price' })).toHaveTextContent(
		'Existing outcome',
	);
	expect(screen.getByText('20.00')).toBeInTheDocument();
	await user.click(screen.getByRole('radio', { name: 'Card view' }));
	fireEvent.click(await screen.findByText('Existing option'));
	fireEvent.click(screen.getByText('Existing outcome'));
	expect(await screen.findByText('Select states')).toBeInTheDocument();
	await user.click(screen.getByRole('radio', { name: 'Shape view' }));
	expect(screen.getByRole('button', { name: 'Forced decision: Drill well' })).toHaveTextContent(
		'1 state',
	);
	expect(screen.getByRole('button', { name: 'Hard evidence: Oil price' })).toHaveTextContent(
		'1 state',
	);
});

test('clicking a Shape selects the Issue and switching either way retains the selection', async () => {
	const user = userEvent.setup();
	renderDiagram();
	await user.click(await screen.findByRole('radio', { name: 'Shape view' }));
	const decision = await screen.findByTestId(`rf__node-${fixture.issues[0].node.id}`);
	await user.click(screen.getByRole('button', { name: 'Delete' }));
	expect(await screen.findByRole('menuitem', { name: 'Delete selected issues' })).toBeDisabled();
	await user.keyboard('{Escape}');
	await user.click(within(decision).getByText('Drill well'));
	for (const view of ['Card view', 'Shape view', 'Card view', 'Shape view']) {
		await user.click(screen.getByRole('radio', { name: view }));
		await user.click(screen.getByRole('button', { name: 'Delete' }));
		expect(
			await screen.findByRole('menuitem', { name: 'Delete selected issues' }),
		).toBeEnabled();
	}
});

test('Shape badges expose existing validation errors and Utility warnings without enabling an invalid solver', async () => {
	fixture.issues[0].decision.options = [];
	fixture.edges = fixture.edges.slice(0, 1);
	const user = userEvent.setup();
	renderDiagram();
	await user.click(await screen.findByRole('radio', { name: 'Shape view' }));
	const error = await screen.findByRole('img', { name: 'Error: Drill well' });
	expect(error).toBeVisible();
	expect(screen.getByRole('img', { name: 'Warning: NPV' })).toBeVisible();
	await user.hover(error);
	expect(await screen.findByRole('tooltip', { name: 'Has missing options' })).toBeInTheDocument();
	await user.unhover(error);
	await user.hover(screen.getByRole('img', { name: 'Warning: NPV' }));
	expect(
		await screen.findByRole('tooltip', {
			name: 'Connect 2+ parent nodes to enable utility table and solver',
		}),
	).toBeInTheDocument();
	expect(fixture.evaluations).toHaveLength(0);
	expect(screen.getAllByText('Error')).toHaveLength(2);
});

test('shared toolbar controls remain available in Shape view and pan/select uses accessible tools', async () => {
	const user = userEvent.setup();
	renderDiagram();
	await user.click(await screen.findByRole('radio', { name: 'Shape view' }));
	expect(screen.getByRole('radio', { name: 'Pan mode' })).toHaveAttribute('aria-checked', 'true');
	await user.click(screen.getByRole('radio', { name: 'Selection mode' }));
	expect(screen.getByRole('radio', { name: 'Selection mode' })).toHaveAttribute(
		'aria-checked',
		'true',
	);
	for (const name of ['Zoom in', 'Zoom out', 'Fit view', 'Layout controls', 'Create Issue']) {
		expect(screen.getByRole('button', { name })).toBeInTheDocument();
	}
	expect(screen.getByText('Scenario EV')).toBeInTheDocument();
	expect(screen.queryByRole('button', { name: 'Visibility' })).toBeNull();
	await user.click(screen.getByRole('radio', { name: 'Card view' }));
	expect(screen.getByRole('radio', { name: 'Selection mode' })).toHaveAttribute(
		'aria-checked',
		'true',
	);
});

test('keyboard users can focus and activate the view switch using the existing toolbar primitives', async () => {
	localStorage.setItem('influenceDiagramView', JSON.stringify('removed-view'));
	const user = userEvent.setup();
	renderDiagram();
	await user.click(await screen.findByRole('radio', { name: 'Card view' }));
	await user.keyboard('{ArrowRight}');
	expect(screen.getByRole('radio', { name: 'Shape view' })).toHaveFocus();
	await user.keyboard(' ');
	expect(screen.getByRole('radio', { name: 'Shape view' })).toBeChecked();
	expect(screen.queryByRole('button', { name: 'Expand All' })).toBeNull();
});

test('an Uncertainty error tooltip lists both missing Outcomes and invalid Probability table messages', async () => {
	fixture.issues[1].uncertainty.outcomes = [];
	fixture.probabilities[0].probability = 0.5;
	const user = userEvent.setup();
	renderDiagram();
	await user.click(await screen.findByRole('radio', { name: 'Shape view' }));
	const badge = await screen.findByRole('img', { name: 'Error: Oil price' });
	await user.hover(badge);
	const tooltip = await screen.findByRole('tooltip', { name: /Has missing outcomes/ });
	expect(tooltip).toHaveTextContent('Has invalid probability table');
	expect(screen.queryByRole('img', { name: 'Warning: NPV' })).toBeNull();
	expect(fixture.evaluations).toHaveLength(0);
});

test('an error takes precedence over a Utility warning while its tooltip retains both messages', async () => {
	fixture.edges = [
		fixture.edges[0],
		{
			...fixture.edges[1],
			tail_id: fixture.issues[2].node.id,
			head_id: fixture.issues[0].node.id,
		},
	];
	const user = userEvent.setup();
	renderDiagram();
	await user.click(await screen.findByRole('radio', { name: 'Shape view' }));
	const badge = await screen.findByRole('img', { name: 'Error: NPV' });
	expect(screen.queryByRole('img', { name: 'Warning: NPV' })).toBeNull();
	await user.hover(badge);
	const tooltip = await screen.findByRole('tooltip', { name: /Connect 2\+ parent nodes/ });
	expect(tooltip).toHaveTextContent('Has arcs in a loop');
	expect(fixture.evaluations).toHaveLength(0);
});

test('returning to Card view retains the existing Issue editor and discards transient Card menus on switching', async () => {
	const user = userEvent.setup();
	renderDiagram();
	const decision = await screen.findByTestId(`rf__node-${fixture.issues[0].node.id}`);
	fireEvent.click(within(decision).getByRole('button', { name: 'Issue actions' }));
	expect(await screen.findByRole('menuitem', { name: 'Edit' })).toBeInTheDocument();
	await user.click(screen.getByRole('radio', { name: 'Shape view' }));
	expect(screen.queryByRole('menuitem', { name: 'Edit' })).toBeNull();
	await user.click(screen.getByRole('radio', { name: 'Card view' }));
	fireEvent.click(
		within(await screen.findByTestId(`rf__node-${fixture.issues[0].node.id}`)).getByRole(
			'button',
			{ name: 'Issue actions' },
		),
	);
	await user.click(await screen.findByRole('menuitem', { name: 'Edit' }));
	const dialog = await screen.findByRole('dialog', { name: 'Edit Issue' });
	expect(within(dialog).getByRole('textbox', { name: 'Issue name' })).toHaveValue('Drill well');
	await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
	expect(screen.queryByRole('dialog', { name: 'Edit Issue' })).toBeNull();
});
