import { QueryClient } from '@tanstack/react-query';
import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError } from 'axios';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { apiClient } from '../../../../api';
import { Edge, RestrictionEntry, RestrictionTable } from '../../../../validators';
import {
	createDiagramFixture,
	diagramIssue,
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
const originalHitTest = Object.getOwnPropertyDescriptor(document, 'elementFromPoint');
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
	const transport = diagramTransport(fixture);
	apiClient.defaults.adapter = async config => {
		if (config.url === '/edges' && config.method === 'post') {
			const edges: Edge[] = JSON.parse(config.data);
			fixture.edges.push(...edges);
			return { ...(await transport(config)), data: structuredClone(edges) };
		}
		if (config.url === '/edges' && config.method === 'put') {
			const edges: Edge[] = JSON.parse(config.data);
			fixture.edges = fixture.edges.map(
				edge => edges.find(next => next.id === edge.id) ?? edge,
			);
			return { ...(await transport(config)), data: structuredClone(edges) };
		}
		return transport(config);
	};
});

afterEach(() => {
	cleanup();
	queryClient.clear();
	apiClient.defaults.adapter = originalAdapter;
	if (originalHitTest) Object.defineProperty(document, 'elementFromPoint', originalHitTest);
	else Reflect.deleteProperty(document, 'elementFromPoint');
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
	restoreDom();
});

const edgeWrites = () =>
	fixture.requests.filter(request => request.method === 'post' && request.url === '/edges');

const drag = (source: Element, target: Element) => {
	// ReactFlow owns the gesture; actual body hit areas need a browser check.
	Object.defineProperty(document, 'elementFromPoint', {
		configurable: true,
		value: () => target,
	});
	fireEvent.pointerDown(source, { button: 0, clientX: 10, clientY: 10 });
	fireEvent.mouseDown(source, { button: 0, clientX: 10, clientY: 10 });
	fireEvent.mouseMove(document, { clientX: 40, clientY: 10, buttons: 1 });
	fireEvent.pointerUp(target, { button: 0, clientX: 40, clientY: 10 });
	fireEvent.mouseUp(target, { button: 0, clientX: 40, clientY: 10 });
};

test('choosing an arc target saves the source-to-target direction and displays the same arc in both views', async () => {
	const user = userEvent.setup();
	const diagram = renderInfluenceDiagram(queryClient, fixture.project);
	const decision = await screen.findByTestId(`rf__node-${fixture.issues[0].node.id}`);
	await user.click(within(decision).getByRole('button', { name: 'Add arc' }));
	const picker = await screen.findByRole('menu', { name: 'Add arc to' });
	expect(within(picker).queryByText('Uncertainty')).toBeNull();
	const targetItem = within(picker).getByRole('menuitem', { name: 'Uncertainty Oil price' });
	expect(targetItem).toHaveTextContent('Oil price');
	expect(within(targetItem).queryByRole('button', { hidden: true })).toBeNull();
	await user.click(targetItem);
	await waitFor(() => expect(screen.queryByRole('menu', { name: 'Add arc to' })).toBeNull());
	const source = fixture.issues[0].node.id;
	const target = fixture.issues[1].node.id;
	await waitFor(() =>
		expect(edgeWrites()).toEqual([
			expect.objectContaining({
				url: '/edges',
				data: [
					expect.objectContaining({
						tail_id: source,
						head_id: target,
						project_id: fixture.project.id,
					}),
				],
			}),
		]),
	);
	for (const view of ['Card view', 'Shape view']) {
		await user.click(screen.getByRole('radio', { name: view }));
		expect(
			await screen.findByRole('group', { name: `Edge from ${source} to ${target}` }),
		).toBeInTheDocument();
	}
	diagram.unmount();
	queryClient.clear();
	renderInfluenceDiagram(queryClient, fixture.project);
	expect(
		await screen.findByRole('group', { name: `Edge from ${source} to ${target}` }),
	).toBeInTheDocument();
	expect(fixture.edges).toContainEqual(
		expect.objectContaining({ tail_id: source, head_id: target }),
	);
});

test('a connection drag returning to its source does not open the picker, and a subsequent click still works', async () => {
	const user = userEvent.setup();
	renderInfluenceDiagram(queryClient, fixture.project);
	const decision = await screen.findByTestId(`rf__node-${fixture.issues[0].node.id}`);
	const handle = within(decision).getByRole('button', { name: 'Add arc' });
	drag(handle, handle);
	fireEvent.click(handle, { detail: 1 });
	expect(screen.queryByRole('menu', { name: 'Add arc to' })).toBeNull();
	expect(edgeWrites()).toHaveLength(0);
	await user.click(handle);
	expect(await screen.findByRole('menu', { name: 'Add arc to' })).toBeVisible();
	drag(handle, handle);
	fireEvent.click(handle, { detail: 1 });
	expect(screen.queryByRole('menu', { name: 'Add arc to' })).toBeNull();
	expect(edgeWrites()).toHaveLength(0);
	await user.click(handle);
	expect(await screen.findByRole('menu', { name: 'Add arc to' })).toBeVisible();
});

test.each(['shape', 'card'])(
	'dragging the %s source handle saves exactly one arc without opening a click picker',
	async view => {
		localStorage.setItem('influenceDiagramView', JSON.stringify(view));
		renderInfluenceDiagram(queryClient, fixture.project);
		const source = await screen.findByTestId(`rf__node-${fixture.issues[0].node.id}`);
		const target = screen.getByTestId(`rf__node-${fixture.issues[1].node.id}`);
		const handle = source.querySelector('[data-handleid="node-source"]');
		const targetHandle = target.querySelector('[data-handleid="node-target"]');
		expect(handle).not.toBeNull();
		expect(targetHandle).not.toBeNull();
		drag(handle!, targetHandle!);
		await waitFor(() => expect(edgeWrites()).toHaveLength(1));
		expect(edgeWrites()[0].data).toEqual([
			expect.objectContaining({
				tail_id: fixture.issues[0].node.id,
				head_id: fixture.issues[1].node.id,
			}),
		]);
		expect(
			await screen.findByRole('group', {
				name: `Edge from ${fixture.issues[0].node.id} to ${fixture.issues[1].node.id}`,
			}),
		).toBeInTheDocument();
		expect(screen.queryByRole('menu', { name: 'Add arc to' })).toBeNull();
		expect(edgeWrites()).toHaveLength(1);
	},
);

test('the picker includes only visible eligible targets, excluding self and existing arcs in either direction', async () => {
	const incoming = diagramIssue('License', 'Decision');
	const available = diagramIssue('Exploration result', 'Uncertainty');
	const tactical = diagramIssue('Tactical decision', 'Decision');
	tactical.decision.type = 'Tactical';
	const nonKey = diagramIssue('Non-key uncertainty', 'Uncertainty');
	nonKey.uncertainty.is_key = false;
	fixture.issues.push(
		incoming,
		available,
		diagramIssue('Fact', 'Fact'),
		diagramIssue('Unassigned', 'Unassigned'),
		{ ...diagramIssue('Outside', 'Decision'), boundary: 'out' },
		tactical,
		nonKey,
	);
	fixture.edges.push({
		id: crypto.randomUUID(),
		project_id: fixture.project.id,
		tail_id: incoming.node.id,
		head_id: fixture.issues[0].node.id,
	});
	const user = userEvent.setup();
	renderInfluenceDiagram(queryClient, fixture.project);
	const source = await screen.findByTestId(`rf__node-${fixture.issues[0].node.id}`);
	await user.click(within(source).getByRole('button', { name: 'Add arc' }));
	const picker = await screen.findByRole('menu', { name: 'Add arc to' });
	expect(
		within(picker)
			.getAllByRole('menuitem')
			.map(item => item.textContent),
	).toEqual(['Oil price', 'Exploration result']);
	expect(
		within(screen.getByTestId(`rf__node-${fixture.issues[2].node.id}`)).queryByRole('button', {
			name: 'Add arc',
		}),
	).toBeNull();
	expect(edgeWrites()).toHaveLength(0);
});

test('when no targets remain the picker explains that no nodes are available without allowing a write', async () => {
	fixture.edges.push({
		id: crypto.randomUUID(),
		project_id: fixture.project.id,
		tail_id: fixture.issues[1].node.id,
		head_id: fixture.issues[0].node.id,
	});
	const user = userEvent.setup();
	renderInfluenceDiagram(queryClient, fixture.project);
	const source = await screen.findByTestId(`rf__node-${fixture.issues[0].node.id}`);
	await user.click(within(source).getByRole('button', { name: 'Add arc' }));
	const empty = await screen.findByRole('menuitem', { name: 'No available nodes' });
	expect(empty).toBeDisabled();
	fireEvent.click(empty);
	expect(edgeWrites()).toHaveLength(0);
	expect(screen.getByRole('menu', { name: 'Add arc to' })).toBeVisible();
	await user.keyboard('{Escape}');
	expect(screen.queryByRole('menu', { name: 'Add arc to' })).toBeNull();
});

test('a failed arc creation reports the existing error, rolls back the arc in both views, and allows retry', async () => {
	const transport = apiClient.defaults.adapter;
	apiClient.defaults.adapter = async config => {
		if (config.url === '/edges' && config.method === 'post') {
			fixture.requests.push({
				method: config.method,
				url: config.url,
				data: JSON.parse(config.data),
			});
			throw new AxiosError('Service unavailable', 'ERR_NETWORK', config);
		}
		if (typeof transport !== 'function') throw new Error('Expected diagram transport');
		return transport(config);
	};
	const user = userEvent.setup();
	renderInfluenceDiagram(queryClient, fixture.project);
	const source = await screen.findByTestId(`rf__node-${fixture.issues[0].node.id}`);
	await user.click(within(source).getByRole('button', { name: 'Add arc' }));
	await user.click(await screen.findByRole('menuitem', { name: 'Uncertainty Oil price' }));
	expect(await screen.findByText('Failed to create edge')).toBeVisible();
	const edgeName = `Edge from ${fixture.issues[0].node.id} to ${fixture.issues[1].node.id}`;
	await waitFor(() => expect(screen.queryByRole('group', { name: edgeName })).toBeNull());
	expect(screen.queryByRole('menu', { name: 'Add arc to' })).toBeNull();
	expect(edgeWrites()).toHaveLength(1);
	expect(fixture.edges).toHaveLength(2);
	await user.click(screen.getByRole('radio', { name: 'Card view' }));
	expect(screen.queryByRole('group', { name: edgeName })).toBeNull();
	await user.click(screen.getByRole('radio', { name: 'Shape view' }));
	const returned = await screen.findByTestId(`rf__node-${fixture.issues[0].node.id}`);
	await user.click(within(returned).getByRole('button', { name: 'Add arc' }));
	expect(await screen.findByRole('menuitem', { name: 'Uncertainty Oil price' })).toBeVisible();
	apiClient.defaults.adapter = transport;
	await user.click(screen.getByRole('menuitem', { name: 'Uncertainty Oil price' }));
	await waitFor(() => expect(edgeWrites()).toHaveLength(2));
	expect(fixture.edges).toHaveLength(3);
	expect(await screen.findByRole('group', { name: edgeName })).toBeInTheDocument();
	expect(edgeWrites()).toHaveLength(2);
});

test('the arc picker and Issue menus replace each other across nodes and dismiss without creating an arc', async () => {
	const user = userEvent.setup();
	renderInfluenceDiagram(queryClient, fixture.project);
	const decision = await screen.findByTestId(`rf__node-${fixture.issues[0].node.id}`);
	const uncertainty = screen.getByTestId(`rf__node-${fixture.issues[1].node.id}`);
	const decisionHandle = within(decision).getByRole('button', { name: 'Add arc' });
	const uncertaintyHandle = within(uncertainty).getByRole('button', { name: 'Add arc' });
	await user.click(within(decision).getByRole('button', { name: 'Issue actions' }));
	expect(await screen.findByRole('menu', { name: 'Issue actions: Drill well' })).toBeVisible();
	await user.click(uncertaintyHandle);
	expect(await screen.findByRole('menu', { name: 'Add arc to' })).toBeVisible();
	expect(screen.queryByRole('menu', { name: 'Issue actions: Drill well' })).toBeNull();
	expect(screen.getByRole('menuitem', { name: 'Decision Drill well' })).toBeVisible();
	await user.click(decisionHandle);
	expect(await screen.findByRole('menuitem', { name: 'Uncertainty Oil price' })).toBeVisible();
	expect(screen.getAllByRole('menu')).toHaveLength(1);
	await user.click(within(uncertainty).getByRole('button', { name: 'Issue actions' }));
	expect(await screen.findByRole('menu', { name: 'Issue actions: Oil price' })).toBeVisible();
	expect(screen.queryByRole('menu', { name: 'Add arc to' })).toBeNull();

	await user.click(decisionHandle);
	await user.keyboard('{Escape}');
	await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
	expect(decisionHandle).toHaveFocus();
	await user.click(decisionHandle);
	await user.click(screen.getByRole('radio', { name: 'Selection mode' }));
	expect(screen.queryByRole('menu')).toBeNull();
	await user.click(decisionHandle);
	await user.click(screen.getByRole('radio', { name: 'Card view' }));
	expect(screen.queryByRole('menu')).toBeNull();
	await user.click(screen.getByRole('radio', { name: 'Shape view' }));
	expect(screen.queryByRole('menu')).toBeNull();
	expect(edgeWrites()).toHaveLength(0);
});

test('Escape returns keyboard focus to Add arc and Tab continues through the node controls', async () => {
	const user = userEvent.setup();
	renderInfluenceDiagram(queryClient, fixture.project);
	const decision = await screen.findByTestId(`rf__node-${fixture.issues[0].node.id}`);
	const trigger = within(decision).getByRole('button', { name: 'Add arc' });
	decision.focus();
	await user.tab();
	expect(trigger).toHaveFocus();
	await user.keyboard('{Enter}');
	expect(await screen.findByRole('menuitem', { name: 'Uncertainty Oil price' })).toHaveFocus();
	await user.keyboard('{Escape}');
	await waitFor(() => expect(screen.queryByRole('menu', { name: 'Add arc to' })).toBeNull());
	await waitFor(() => expect(trigger).toHaveFocus());
	await user.tab();
	expect(within(decision).getByRole('button', { name: 'Issue actions' })).toHaveFocus();
	expect(edgeWrites()).toHaveLength(0);
});

test('Issue actions and Add arc dismiss each other without closing inline States or tables', async () => {
	const user = userEvent.setup();
	renderInfluenceDiagram(queryClient, fixture.project);
	const decision = await screen.findByTestId(`rf__node-${fixture.issues[0].node.id}`);
	const uncertainty = screen.getByTestId(`rf__node-${fixture.issues[1].node.id}`);
	await user.click(within(decision).getByRole('button', { name: 'Forced decision: Drill well' }));
	await user.click(within(uncertainty).getByRole('button', { name: 'Probability table' }));
	const controls = [
		[uncertainty, 'Issue actions', 'menu', 'Issue actions: Oil price'],
		[uncertainty, 'Add arc', 'menu', 'Add arc to'],
	] as const;
	for (const [node, name, role, overlayName] of [...controls, ...controls]) {
		await user.click(within(node).getByRole('button', { name }));
		expect(await screen.findByRole(role, { name: overlayName })).toBeVisible();
		await waitFor(() => expect(screen.queryAllByRole('menu')).toHaveLength(1));
		expect(within(decision).getByRole('list')).toBeVisible();
		expect(
			within(uncertainty).getByRole('heading', { name: 'Oil price Probability Table' }),
		).toBeVisible();
	}
	for (const [node, name, role, overlayName] of controls) {
		await user.click(screen.getByRole('radio', { name: 'Selection mode' }));
		await waitFor(() => {
			expect(screen.queryByRole('menu')).toBeNull();
			expect(screen.queryByRole('dialog')).toBeNull();
		});
		await user.click(within(node).getByRole('button', { name }));
		expect(await screen.findByRole(role, { name: overlayName })).toBeVisible();
	}
	await user.click(screen.getByRole('radio', { name: 'Card view' }));
	expect(screen.queryByRole('menu')).toBeNull();
	expect(screen.queryByRole('dialog')).toBeNull();
	expect(edgeWrites()).toHaveLength(0);
});

test('keyboard users can navigate the EDS menu and connect to a Utility', async () => {
	fixture.edges = [];
	const user = userEvent.setup();
	renderInfluenceDiagram(queryClient, fixture.project);
	const decision = await screen.findByTestId(`rf__node-${fixture.issues[0].node.id}`);
	within(decision).getByRole('button', { name: 'Add arc' }).focus();
	await user.keyboard('{Enter}');
	expect(await screen.findByRole('menuitem', { name: 'Uncertainty Oil price' })).toHaveFocus();
	await user.keyboard('{ArrowDown}');
	expect(screen.getByRole('menuitem', { name: 'Utility NPV' })).toHaveFocus();
	await user.keyboard('{Enter}');
	await waitFor(() => expect(edgeWrites()).toHaveLength(1));
	expect(edgeWrites()[0].data).toEqual([
		expect.objectContaining({
			tail_id: fixture.issues[0].node.id,
			head_id: fixture.issues[2].node.id,
		}),
	]);
	expect(screen.queryByRole('menu')).toBeNull();
});

test.each(['self', 'duplicate', 'reverse-direct'])(
	'drag creation rejects a %s arc using the same graph rules as the picker',
	async invalid => {
		const [decision, uncertainty, utility] = fixture.issues;
		if (invalid === 'reverse-direct')
			fixture.edges.push({
				id: crypto.randomUUID(),
				project_id: fixture.project.id,
				tail_id: uncertainty.node.id,
				head_id: decision.node.id,
			});
		renderInfluenceDiagram(queryClient, fixture.project);
		const source = await screen.findByTestId(`rf__node-${fixture.issues[0].node.id}`);
		const targetIssue =
			invalid === 'self' ? decision : invalid === 'duplicate' ? utility : uncertainty;
		const target = screen.getByTestId(`rf__node-${targetIssue.node.id}`);
		const targetHandle = target.querySelector('[data-handleid="node-target"]');
		expect(targetHandle).not.toBeNull();
		drag(within(source).getByRole('button', { name: 'Add arc' }), targetHandle!);
		expect(edgeWrites()).toHaveLength(0);
		expect(screen.queryByRole('menu', { name: 'Add arc to' })).toBeNull();
	},
);

test('arc creation retains the existing longer-cycle policy and existing validation feedback', async () => {
	const license = diagramIssue('License', 'Decision');
	fixture.issues.push(license);
	fixture.edges = [
		{
			...fixture.edges[0],
			head_id: fixture.issues[1].node.id,
		},
		{
			...fixture.edges[1],
			head_id: license.node.id,
		},
	];
	const user = userEvent.setup();
	renderInfluenceDiagram(queryClient, fixture.project);
	const source = await screen.findByTestId(`rf__node-${license.node.id}`);
	await user.click(within(source).getByRole('button', { name: 'Add arc' }));
	await user.click(await screen.findByRole('menuitem', { name: 'Decision Drill well' }));
	await waitFor(() => expect(edgeWrites()).toHaveLength(1));
	expect(edgeWrites()[0].data).toEqual([
		expect.objectContaining({
			tail_id: license.node.id,
			head_id: fixture.issues[0].node.id,
		}),
	]);
	const error = await screen.findByRole('img', { name: 'Error: License' });
	await user.hover(error);
	expect(await screen.findByRole('tooltip', { name: 'Has arcs in a loop' })).toBeVisible();
});

test('an Uncertainty arc updates Utility eligibility without clearing an existing Scenario override', async () => {
	fixture.edges = fixture.edges.slice(0, 1);
	localStorage.setItem('influenceDiagramView', JSON.stringify('card'));
	const user = userEvent.setup();
	renderInfluenceDiagram(queryClient, fixture.project);
	await user.click(await screen.findByRole('button', { name: 'Expand All' }));
	fireEvent.click(await screen.findByText('Existing outcome'));
	await user.click(screen.getByRole('radio', { name: 'Shape view' }));
	const uncertainty = await screen.findByTestId(`rf__node-${fixture.issues[1].node.id}`);
	expect(screen.getByRole('img', { name: 'Warning: NPV' })).toBeVisible();
	expect(screen.getByRole('button', { name: 'Hard evidence: Oil price' })).toHaveTextContent(
		'Existing outcome',
	);
	await user.click(within(uncertainty).getByRole('button', { name: 'Add arc' }));
	await user.click(await screen.findByRole('menuitem', { name: 'Utility NPV' }));
	await waitFor(() => expect(screen.queryByRole('img', { name: 'Warning: NPV' })).toBeNull());
	expect(edgeWrites()[0].data).toEqual([
		expect.objectContaining({
			tail_id: fixture.issues[1].node.id,
			head_id: fixture.issues[2].node.id,
		}),
	]);
	expect(screen.getByRole('button', { name: 'Hard evidence: Oil price' })).toHaveTextContent(
		'Existing outcome',
	);
	expect(await screen.findByText('20.00')).toBeVisible();
	await waitFor(() =>
		expect(fixture.evaluations.at(-1)?.[0].state_ids).toEqual([
			fixture.issues[1].uncertainty.outcomes[0].id,
		]),
	);
});

test('a newly saved arc can be reconnected, and its new target remains excluded from the click picker', async () => {
	const license = diagramIssue('License', 'Decision');
	fixture.issues.push(license);
	const user = userEvent.setup();
	renderInfluenceDiagram(queryClient, fixture.project);
	const source = await screen.findByTestId(`rf__node-${fixture.issues[0].node.id}`);
	await user.click(within(source).getByRole('button', { name: 'Add arc' }));
	await user.click(await screen.findByRole('menuitem', { name: 'Uncertainty Oil price' }));
	const edgeName = `Edge from ${fixture.issues[0].node.id} to ${fixture.issues[1].node.id}`;
	const edge = await screen.findByRole('group', { name: edgeName });
	await waitFor(() => expect(edgeWrites()).toHaveLength(1));
	await user.click(edge);
	await waitFor(() => expect(edge).toHaveClass('selected'));
	const endpoint = edge.querySelector('.react-flow__edgeupdater-target');
	const target = screen
		.getByTestId(`rf__node-${license.node.id}`)
		.querySelector('[data-handleid="node-target"]');
	expect(endpoint).not.toBeNull();
	expect(target).not.toBeNull();
	drag(endpoint!, target!);
	await waitFor(() =>
		expect(
			fixture.requests.filter(
				request => request.url === '/edges' && request.method === 'put',
			),
		).toEqual([
			expect.objectContaining({
				data: [
					expect.objectContaining({
						tail_id: fixture.issues[0].node.id,
						head_id: license.node.id,
					}),
				],
			}),
		]),
	);
	expect(
		await screen.findByRole('group', {
			name: `Edge from ${fixture.issues[0].node.id} to ${license.node.id}`,
		}),
	).toBeInTheDocument();
	expect(screen.queryByRole('group', { name: edgeName })).toBeNull();
	await user.click(within(source).getByRole('button', { name: 'Add arc' }));
	const picker = await screen.findByRole('menu', { name: 'Add arc to' });
	expect(
		within(picker)
			.getAllByRole('menuitem')
			.map(item => item.textContent),
	).toEqual(['Oil price']);
});

test('a newly saved arc retains existing restriction editing and confirmed edge deletion in both views', async () => {
	const transport = apiClient.defaults.adapter;
	apiClient.defaults.adapter = async config => {
		let result: unknown;
		if (config.url === '/restriction_tables' && config.method === 'post') {
			const [request]: { id: string; edge_id: string; project_id: string }[] = JSON.parse(
				config.data,
			);
			const timestamp = '2026-10-21T12:00:00.000Z';
			const table: RestrictionTable = {
				...request,
				name: 'Drill well to Oil price',
				created_at: timestamp,
				updated_at: timestamp,
				restriction_entries: [
					{
						id: crypto.randomUUID(),
						restriction_table_id: request.id,
						created_at: timestamp,
						updated_at: timestamp,
						parent_state_id: fixture.issues[0].decision.options[0].id,
						child_state_id: fixture.issues[1].uncertainty.outcomes[0].id,
						is_parent_uncertainty: false,
						is_child_uncertainty: true,
						restriction_value: 1,
					},
				],
			};
			fixture.restrictions.push(table);
			result = [table];
		}
		if (config.url === '/restriction_entries' && config.method === 'put') {
			const entries: RestrictionEntry[] = JSON.parse(config.data);
			fixture.restrictions = fixture.restrictions.map(table => ({
				...table,
				restriction_entries: table.restriction_entries.map(
					entry => entries.find(next => next.id === entry.id) ?? entry,
				),
			}));
			result = entries;
		}
		if (config.url?.startsWith('/edges/') && config.method === 'delete') {
			const edgeId = config.url.slice('/edges/'.length);
			fixture.edges = fixture.edges.filter(edge => edge.id !== edgeId);
			fixture.restrictions = fixture.restrictions.filter(table => table.edge_id !== edgeId);
		}
		if (typeof transport !== 'function') throw new Error('Expected diagram transport');
		const response = await transport(config);
		return { ...response, data: result ?? response.data };
	};
	const user = userEvent.setup();
	renderInfluenceDiagram(queryClient, fixture.project);
	const source = await screen.findByTestId(`rf__node-${fixture.issues[0].node.id}`);
	await user.click(within(source).getByRole('button', { name: 'Add arc' }));
	await user.click(await screen.findByRole('menuitem', { name: 'Uncertainty Oil price' }));
	const edgeName = `Edge from ${fixture.issues[0].node.id} to ${fixture.issues[1].node.id}`;
	const edge = await screen.findByRole('group', { name: edgeName });
	await waitFor(() => expect(edgeWrites()).toHaveLength(1));
	const savedEdge = fixture.edges.find(
		edge =>
			edge.tail_id === fixture.issues[0].node.id &&
			edge.head_id === fixture.issues[1].node.id,
	);
	fireEvent.mouseEnter(edge);
	const actions = await within(screen.getByRole('application')).findByRole('button', {
		name: '',
	});
	fireEvent.mouseEnter(actions);
	fireEvent.click(actions);
	expect(await screen.findByText('Drill well to Oil price Restriction Table')).toBeVisible();
	const restriction = await screen.findByRole('switch', {
		name: 'Existing option allows Existing outcome',
	});
	expect(restriction).toBeChecked();
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
	expect(fixture.restrictions[0].restriction_entries[0].restriction_value).toBe(0);
	await user.click(screen.getByRole('button', { name: 'Delete edge' }));
	const dialog = await screen.findByRole('dialog');
	expect(dialog).toHaveTextContent('from "Drill well" to "Oil price"');
	await user.click(within(dialog).getByRole('button', { name: 'Delete' }));
	await waitFor(() => expect(screen.queryByRole('group', { name: edgeName })).toBeNull());
	expect(fixture.requests).toContainEqual(
		expect.objectContaining({
			method: 'delete',
			url: `/edges/${savedEdge?.id}`,
		}),
	);
	for (const view of ['Card view', 'Shape view']) {
		await user.click(screen.getByRole('radio', { name: view }));
		expect(screen.queryByRole('group', { name: edgeName })).toBeNull();
	}
	expect(fixture.edges).toHaveLength(2);
});
