import { QueryClient } from '@tanstack/react-query';
import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError } from 'axios';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { apiClient } from '../../../../api';
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

test('Shape menus support keyboard activation, replace each other, dismiss, and remain reachable', async () => {
	const user = userEvent.setup();
	renderInfluenceDiagram(queryClient, fixture.project);
	const decision = await screen.findByTestId(`rf__node-${fixture.issues[0].node.id}`);
	const uncertainty = screen.getByTestId(`rf__node-${fixture.issues[1].node.id}`);
	fireEvent.focus(decision);
	const decisionActions = within(decision).getByRole('button', { name: 'Issue actions' });
	decisionActions.focus();
	await user.keyboard('{Enter}');
	expect(await screen.findByRole('menu', { name: 'Issue actions: Drill well' })).toBeVisible();
	expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus();
	await user.keyboard('{ArrowDown}');
	expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveFocus();
	await user.keyboard('{Escape}');
	await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
	expect(decisionActions).toHaveFocus();

	await user.click(decisionActions);
	await user.click(within(uncertainty).getByRole('button', { name: 'Issue actions' }));
	expect(await screen.findByRole('menu', { name: 'Issue actions: Oil price' })).toBeVisible();
	expect(screen.queryByRole('menu', { name: 'Issue actions: Drill well' })).toBeNull();
	await user.click(screen.getByRole('radio', { name: 'Selection mode' }));
	await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());

	await user.click(decisionActions);
	await user.click(screen.getByRole('radio', { name: 'Card view' }));
	expect(screen.queryByRole('menu')).toBeNull();
	await user.click(screen.getByRole('radio', { name: 'Shape view' }));
	expect(screen.queryByRole('menu')).toBeNull();
	await user.click(
		within(await screen.findByTestId(`rf__node-${fixture.issues[0].node.id}`)).getByRole(
			'button',
			{ name: 'Issue actions' },
		),
	);
	expect(await screen.findByRole('menu', { name: 'Issue actions: Drill well' })).toBeVisible();
	await user.keyboard('{ArrowDown}');
	await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus());
	await user.keyboard('{Enter}');
	const dialog = await screen.findByRole('dialog', { name: 'Edit Issue' });
	expect(within(dialog).getByRole('textbox', { name: 'Issue name' })).toHaveValue('Drill well');
	await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
});

test('Shape inspection includes non-empty descriptions and preserves body selection without opening an editor', async () => {
	fixture.issues[0].description = 'Assess whether to drill this well before committing capital.';
	fixture.issues[1].description = '   ';
	fixture.issues[2].description = '';
	const user = userEvent.setup();
	renderInfluenceDiagram(queryClient, fixture.project);
	const decision = await screen.findByTestId(`rf__node-${fixture.issues[0].node.id}`);
	await user.hover(within(decision).getByText('Drill well'));
	expect(
		within(decision).getByText('Assess whether to drill this well before committing capital.'),
	).toBeVisible();
	expect(screen.getAllByRole('note')).toHaveLength(1);
	await user.click(within(decision).getByText('Drill well'));
	expect(screen.queryByRole('dialog')).toBeNull();
	await user.click(screen.getByRole('button', { name: 'Delete' }));
	expect(await screen.findByRole('menuitem', { name: 'Delete selected issues' })).toBeEnabled();
});

test('Edit opens the existing Issue dialog, cancellation preserves the Issue, and saving updates both views', async () => {
	const user = userEvent.setup();
	renderInfluenceDiagram(queryClient, fixture.project);
	const openEditor = async () => {
		const decision = await screen.findByTestId(`rf__node-${fixture.issues[0].node.id}`);
		await user.click(within(decision).getByRole('button', { name: 'Issue actions' }));
		await user.click(await screen.findByRole('menuitem', { name: 'Edit' }));
		return screen.findByRole('dialog', { name: 'Edit Issue' });
	};
	const canceled = await openEditor();
	await user.clear(within(canceled).getByRole('textbox', { name: 'Issue name' }));
	await user.type(within(canceled).getByRole('textbox', { name: 'Issue name' }), 'Discard me');
	await user.click(within(canceled).getByRole('button', { name: 'Cancel' }));
	expect(screen.queryByRole('dialog')).toBeNull();
	expect(screen.getByText('Drill well')).toBeInTheDocument();
	expect(fixture.requests.filter(request => request.method === 'put')).toHaveLength(0);

	const dialog = await openEditor();
	expect(within(dialog).getByRole('textbox', { name: 'Issue name' })).toHaveValue('Drill well');
	await user.clear(within(dialog).getByRole('textbox', { name: 'Issue name' }));
	await user.type(within(dialog).getByRole('textbox', { name: 'Issue name' }), 'Develop well');
	await user.clear(within(dialog).getByRole('textbox', { name: 'Description' }));
	await user.type(
		within(dialog).getByRole('textbox', { name: 'Description' }),
		'Updated project context.',
	);
	await user.click(within(dialog).getByRole('button', { name: 'Update Issue' }));
	await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
	expect(await screen.findByText('Develop well')).toBeInTheDocument();
	expect(screen.getByText('Updated project context.')).toBeInTheDocument();
	expect(fixture.requests.filter(request => request.method === 'put')).toEqual([
		expect.objectContaining({
			url: '/issues',
			data: [
				expect.objectContaining({
					id: fixture.issues[0].id,
					name: 'Develop well',
					description: 'Updated project context.',
				}),
			],
		}),
	]);
	await user.click(screen.getByRole('radio', { name: 'Card view' }));
	expect(await screen.findByText('Develop well')).toBeInTheDocument();
	expect(screen.queryByText('Drill well')).toBeNull();
});

test('Delete uses the existing confirmation, cancellation preserves the Issue, and confirmation deletes it from both views', async () => {
	const deletedIssueId = fixture.issues[0].id;
	const user = userEvent.setup();
	renderInfluenceDiagram(queryClient, fixture.project);
	const openConfirmation = async () => {
		const decision = await screen.findByTestId(`rf__node-${fixture.issues[0].node.id}`);
		await user.click(within(decision).getByRole('button', { name: 'Issue actions' }));
		await user.click(await screen.findByRole('menuitem', { name: 'Delete' }));
		return screen.findByRole('dialog');
	};
	const canceled = await openConfirmation();
	expect(within(canceled).getByRole('heading', { name: 'Delete Issue' })).toBeInTheDocument();
	expect(canceled).toHaveTextContent('Are you sure you want to delete the issue "Drill well"?');
	await user.click(within(canceled).getByRole('button', { name: 'Cancel' }));
	expect(screen.queryByRole('dialog')).toBeNull();
	expect(screen.getByText('Drill well')).toBeInTheDocument();
	expect(fixture.requests.filter(request => request.method === 'delete')).toHaveLength(0);
	const confirmation = await openConfirmation();
	await user.click(within(confirmation).getByRole('button', { name: 'Delete' }));
	await waitFor(() => expect(screen.queryByText('Drill well')).toBeNull());
	expect(fixture.requests.filter(request => request.method === 'delete')).toEqual([
		expect.objectContaining({ url: `/issues/${deletedIssueId}` }),
	]);
	await user.click(screen.getByRole('radio', { name: 'Card view' }));
	expect(await screen.findByText('Oil price')).toBeInTheDocument();
	expect(screen.queryByText('Drill well')).toBeNull();
	await user.click(screen.getByRole('radio', { name: 'Shape view' }));
	expect(screen.queryByText('Drill well')).toBeNull();
});

test('saving an Issue outside the decision boundary removes it from both diagram presentations', async () => {
	const user = userEvent.setup();
	renderInfluenceDiagram(queryClient, fixture.project);
	const decision = await screen.findByTestId(`rf__node-${fixture.issues[0].node.id}`);
	await user.click(within(decision).getByRole('button', { name: 'Issue actions' }));
	await user.click(await screen.findByRole('menuitem', { name: 'Edit' }));
	const dialog = await screen.findByRole('dialog', { name: 'Edit Issue' });
	await user.click(within(dialog).getByRole('radio', { name: 'Out' }));
	await user.click(within(dialog).getByRole('button', { name: 'Update Issue' }));
	await waitFor(() => expect(screen.queryByText('Drill well')).toBeNull());
	expect(fixture.requests).toContainEqual(
		expect.objectContaining({
			method: 'put',
			url: '/issues',
			data: [expect.objectContaining({ id: fixture.issues[0].id, boundary: 'out' })],
		}),
	);
	await user.click(screen.getByRole('radio', { name: 'Card view' }));
	expect(await screen.findByText('Oil price')).toBeInTheDocument();
	expect(screen.queryByText('Drill well')).toBeNull();
});

test.each([
	{ view: 'card', isKey: false },
	{ view: 'shape', isKey: false },
	{ view: 'shape', isKey: true },
])(
	'saving a Decision as an Uncertainty with is_key=$isKey updates $view view',
	async ({ view, isKey }) => {
		localStorage.setItem('influenceDiagramView', JSON.stringify(view));
		// Report geometry changes that jsdom's ResizeObserver does not detect.
		vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (
			this: HTMLElement,
		) {
			return this.querySelector('.influence-shape-body > svg') ? 180 : 140;
		});
		const DiagramResizeObserver = ResizeObserver;
		vi.stubGlobal(
			'ResizeObserver',
			class extends DiagramResizeObserver {
				private mutations = new Map<Element, MutationObserver>();
				observe(target: Element) {
					super.observe(target);
					if (!(target instanceof HTMLElement)) return;
					let height = target.offsetHeight;
					const observer = new MutationObserver(() => {
						if (height === target.offsetHeight) return;
						height = target.offsetHeight;
						super.observe(target);
					});
					observer.observe(target, { childList: true, subtree: true });
					this.mutations.set(target, observer);
				}
				unobserve(target: Element) {
					super.unobserve(target);
					this.mutations.get(target)?.disconnect();
					this.mutations.delete(target);
				}
				disconnect() {
					super.disconnect();
					for (const observer of this.mutations.values()) observer.disconnect();
					this.mutations.clear();
				}
			},
		);
		const user = userEvent.setup();
		renderInfluenceDiagram(queryClient, fixture.project);
		const issue = fixture.issues[0];
		const nodeId = `rf__node-${issue.node.id}`;
		const node = await screen.findByTestId(nodeId);
		within(node).getByRole('button', { name: 'Issue actions' }).focus();
		await user.keyboard('{Enter}');
		await user.click(await screen.findByRole('menuitem', { name: 'Edit' }));
		const dialog = await screen.findByRole('dialog', { name: 'Edit Issue' });
		await user.click(within(dialog).getByRole('radio', { name: 'Uncertainty' }));
		const keySwitch = within(dialog).getByRole('switch', { name: 'Is Key' });
		expect(keySwitch).toBeChecked();
		if (!isKey) await user.click(keySwitch);
		await user.click(within(dialog).getByRole('button', { name: 'Update Issue' }));

		await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
		expect(fixture.requests).toContainEqual(
			expect.objectContaining({
				method: 'put',
				url: '/issues',
				data: [
					expect.objectContaining({
						id: issue.id,
						type: 'Uncertainty',
						uncertainty: expect.objectContaining({ is_key: isKey }),
					}),
				],
			}),
		);
		if (isKey) {
			await waitFor(() => expect(node).toHaveClass('react-flow__node-uncertainty'));
			expect(node.querySelector('.influence-shape-body > svg')).toBeInTheDocument();
			expect(within(node).getByText(issue.name)).toBeInTheDocument();
		} else {
			await waitFor(() => expect(screen.queryByText(issue.name)).toBeNull());
		}
	},
);

test.each(['put', 'delete'])(
	'a failed %s reports the existing error and preserves the Issue in both views',
	async method => {
		const failedRequests: string[] = [];
		const transport = diagramTransport(fixture);
		apiClient.defaults.adapter = async config => {
			if (config.method === method) {
				failedRequests.push(config.url ?? '');
				throw new AxiosError('Service unavailable', 'ERR_NETWORK', config);
			}
			return transport(config);
		};
		const user = userEvent.setup();
		renderInfluenceDiagram(queryClient, fixture.project);
		const decision = await screen.findByTestId(`rf__node-${fixture.issues[0].node.id}`);
		await user.click(within(decision).getByRole('button', { name: 'Issue actions' }));
		await user.click(
			await screen.findByRole('menuitem', { name: method === 'put' ? 'Edit' : 'Delete' }),
		);
		const dialog = await screen.findByRole('dialog');
		if (method === 'put') {
			await user.clear(within(dialog).getByRole('textbox', { name: 'Issue name' }));
			await user.type(
				within(dialog).getByRole('textbox', { name: 'Issue name' }),
				'Unsaved name',
			);
			await user.click(within(dialog).getByRole('button', { name: 'Update Issue' }));
			expect(await screen.findByText('Failed to update issue')).toBeInTheDocument();
			expect(screen.getByRole('dialog', { name: 'Edit Issue' })).toBeVisible();
			await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
		} else {
			await user.click(within(dialog).getByRole('button', { name: 'Delete' }));
			expect(await screen.findByText('Failed to delete issue')).toBeInTheDocument();
		}
		expect(failedRequests).toEqual([
			method === 'put' ? '/issues' : `/issues/${fixture.issues[0].id}`,
		]);
		expect(
			await screen.findByTestId(`rf__node-${fixture.issues[0].node.id}`),
		).toBeInTheDocument();
		await user.click(screen.getByRole('radio', { name: 'Card view' }));
		expect(await screen.findByText('Drill well')).toBeInTheDocument();
		expect(screen.queryByText('Unsaved name')).toBeNull();
	},
);

test.each([
	['Uncertainty', 'Oil price'],
	['Utility', 'NPV'],
])('%s menus edit the underlying Issue', async (type, name) => {
	const user = userEvent.setup();
	renderInfluenceDiagram(queryClient, fixture.project);
	const node = await screen.findByTestId(
		`rf__node-${fixture.issues[type === 'Uncertainty' ? 1 : 2].node.id}`,
	);
	await user.click(within(node).getByRole('button', { name: 'Issue actions' }));
	await user.click(await screen.findByRole('menuitem', { name: 'Edit' }));
	const dialog = await screen.findByRole('dialog', { name: 'Edit Issue' });
	expect(within(dialog).getByRole('textbox', { name: 'Issue name' })).toHaveValue(name);
	await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
	await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
});
