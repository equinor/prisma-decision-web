import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosAdapter } from 'axios';
import { Toaster, toast } from 'sonner';
import { Link, MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { apiClient } from '../../../../api';
import { existingIssue, project } from '../../../../test/issueFixtures';
import { Issue, issueSchema } from '../../../../validators';
import { ProjectContext } from '../../ProjectContext';
import { ListView } from './ListView';
import { ProjectIssues } from '../ProjectIssues';

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

let savedIssues: Issue[];
let submissions: Issue[];

const adapter: AxiosAdapter = async config => {
	let response = savedIssues;
	if (config.method === 'post') {
		expect(config.url).toBe('/issues');
		const issues = issueSchema.array().parse(JSON.parse(config.data));
		submissions.push(...issues);
		savedIssues.push(...issues);
		response = issues;
	}
	return {
		config,
		status: 200,
		statusText: 'OK',
		headers: {},
		data: structuredClone(response),
	};
};

beforeEach(() => {
	localStorage.clear();
	savedIssues = [];
	submissions = [];
	apiClient.interceptors.request.clear();
	apiClient.defaults.adapter = adapter;
});
afterEach(() => {
	toast.dismiss();
	vi.useRealTimers();
});

const renderList = (view = <ListView />) => {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	queryClient.setQueryData(['issues'], []);
	render(
		<QueryClientProvider client={queryClient}>
			<ProjectContext value={project}>{view}</ProjectContext>
			<Toaster />
		</QueryClientProvider>,
	);
	return userEvent.setup();
};

test('quick-add is available on an empty List and creates an issue with shared defaults', async () => {
	const user = renderList();
	const name = screen.getByRole('textbox', { name: 'Issue name' });
	const description = screen.getByRole('textbox', { name: 'Description' });
	expect(name.tagName).toBe('INPUT');
	expect(description.tagName).toBe('INPUT');
	expect(
		screen.getByRole('form', { name: 'Quick-create issue' }).querySelector('textarea'),
	).toBeNull();
	expect(screen.getByRole('radio', { name: 'Unassigned' })).toBeChecked();
	expect(screen.getByRole('radio', { name: 'In' })).toBeChecked();
	expect(screen.getByRole('button', { name: 'Create issue' })).toBeDisabled();
	await user.type(name, ' Rig availability ');
	await user.type(description, ' Availability during summer ');
	await user.click(screen.getByRole('button', { name: 'Create issue' }));
	const table = await screen.findByRole('table', { name: 'Issues filtered out' });
	expect(within(table).getByText('Rig availability')).toBeInTheDocument();
	expect(within(table).getByText('Availability during summer')).toBeInTheDocument();
	await waitFor(() => expect(name).toHaveValue(''));
	expect(description).toHaveValue('');
	expect(name).toHaveFocus();
	expect(submissions).toHaveLength(1);
	expect(submissions[0]).toMatchObject({
		project_id: project.id,
		name: ' Rig availability ',
		description: ' Availability during summer ',
		type: 'Unassigned',
		boundary: 'in',
		decision: { type: 'Policy', options: [] },
		uncertainty: { is_key: false, outcomes: [] },
	});
});

test('Enter from either text field supports rapid entry and Shift+Enter does not submit', async () => {
	const user = renderList();
	const name = screen.getByRole('textbox', { name: 'Issue name' });
	const description = screen.getByRole('textbox', { name: 'Description' });
	await user.click(screen.getByRole('radio', { name: 'Uncertainty' }));
	await user.click(screen.getByRole('radio', { name: 'On' }));
	await user.type(name, ' Oil price ');
	await user.type(description, ' First paragraph ');
	await user.keyboard('{Shift>}{Enter}{/Shift} Second paragraph ');
	expect(description).toHaveValue(' First paragraph  Second paragraph ');
	expect(submissions).toHaveLength(0);
	await user.keyboard('{Enter}');
	expect(
		await within(await screen.findByRole('table', { name: 'Issues filtered out' })).findByText(
			'Oil price',
		),
	).toBeInTheDocument();
	await waitFor(() => expect(name).toHaveFocus());
	expect(name).toHaveValue('');
	expect(description).toHaveValue('');
	expect(screen.getByRole('radio', { name: 'Uncertainty' })).toBeChecked();
	expect(screen.getByRole('radio', { name: 'On' })).toBeChecked();
	await user.type(description, ' Volumes over the field life ');
	await user.type(name, ' Reservoir volume {Enter}');
	expect(await screen.findByText('Reservoir volume')).toBeInTheDocument();
	await waitFor(() => expect(name).toHaveFocus());
	expect(submissions).toHaveLength(2);
	expect(submissions[0]).toMatchObject({
		name: ' Oil price ',
		description: ' First paragraph  Second paragraph ',
		type: 'Uncertainty',
		boundary: 'on',
		uncertainty: { is_key: false },
	});
	expect(submissions[1]).toMatchObject({ type: 'Uncertainty', boundary: 'on' });
	expect(submissions[1].id).not.toBe(submissions[0].id);
	expect(submissions[1].node.node_style).toMatchObject({ x_position: 290, y_position: 0 });
});

test('Enter validates whitespace drafts despite a disabled button and focuses missing fields in order', async () => {
	const user = renderList();
	const name = screen.getByRole('textbox', { name: 'Issue name' });
	const description = screen.getByRole('textbox', { name: 'Description' });
	await user.type(name, '   ');
	await user.type(description, '  {Shift>}{Enter}{/Shift}  {Enter}');
	expect(screen.getByRole('button', { name: 'Create issue' })).toBeDisabled();
	expect(await screen.findByText('Issue name is required')).toHaveAttribute('role', 'alert');
	expect(screen.getByText('Issue description is required')).toHaveAttribute('role', 'alert');
	expect(name).toHaveAttribute('aria-invalid', 'true');
	expect(description).toHaveAttribute('aria-invalid', 'true');
	await waitFor(() => expect(name).toHaveFocus());
	await user.type(name, ' Licence period ');
	await waitFor(() =>
		expect(screen.queryByText('Issue name is required')).not.toBeInTheDocument(),
	);
	expect(screen.getByText('Issue description is required')).toBeInTheDocument();
	await user.keyboard('{Enter}');
	await waitFor(() => expect(description).toHaveFocus());
	await user.type(description, ' Production ends in 2032 ');
	await waitFor(() =>
		expect(screen.queryByText('Issue description is required')).not.toBeInTheDocument(),
	);
	expect(screen.getByRole('button', { name: 'Create issue' })).toBeEnabled();
	await user.clear(name);
	await user.click(description);
	await user.keyboard('{Enter}');
	await waitFor(() => expect(name).toHaveFocus());
	expect(await screen.findByText('Issue name is required')).toBeInTheDocument();
	expect(submissions).toHaveLength(0);
	expect(screen.queryByRole('table')).not.toBeInTheDocument();
});

test('type and boundary radio groups support keyboard selection and type hints on hover and focus', async () => {
	const user = renderList();
	const types = screen.getByRole('radiogroup', { name: 'Issue type' });
	const boundary = screen.getByRole('radiogroup', { name: 'Boundary' });
	expect(
		within(types)
			.getAllByRole('radio')
			.map(radio => radio.getAttribute('value')),
	).toEqual(['Unassigned', 'Decision', 'Uncertainty', 'Fact', 'Utility']);
	expect(
		within(boundary)
			.getAllByRole('radio')
			.map(radio => radio.getAttribute('value')),
	).toEqual(['in', 'on', 'out']);
	for (const label of ['Unassigned', 'Decision', 'Uncertainty', 'Fact', 'Utility']) {
		await user.hover(within(types).getByText(label));
		expect(await screen.findByRole('tooltip', { name: `Type: ${label}` })).toBeVisible();
		await user.click(within(types).getByRole('radio', { name: label }));
		expect(within(types).getByRole('radio', { name: label })).toHaveFocus();
		expect(await screen.findByRole('tooltip', { name: `Type: ${label}` })).toBeVisible();
		await user.unhover(within(types).getByText(label));
	}
	await user.hover(within(types).getByText('Decision'));
	expect(await screen.findByText('Type: Decision')).toBeVisible();
	await user.unhover(within(types).getByText('Decision'));
	await user.click(within(types).getByRole('radio', { name: 'Unassigned' }));
	expect(await screen.findByText('Type: Unassigned')).toBeVisible();
	await user.keyboard('{ArrowRight}');
	expect(within(types).getByRole('radio', { name: 'Decision' })).toBeChecked();
	expect(within(types).getByRole('radio', { name: 'Decision' })).toHaveFocus();
	expect(await screen.findByText('Type: Decision')).toBeVisible();
	await user.keyboard('{End}');
	expect(within(types).getByRole('radio', { name: 'Utility' })).toBeChecked();
	await user.keyboard('{ArrowRight}');
	expect(within(types).getByRole('radio', { name: 'Unassigned' })).toBeChecked();
	await user.keyboard('{Home}');
	expect(within(types).getByRole('radio', { name: 'Unassigned' })).toHaveFocus();
	await user.click(within(boundary).getByRole('radio', { name: 'In' }));
	await user.keyboard('{ArrowDown}');
	expect(within(boundary).getByRole('radio', { name: 'On' })).toBeChecked();
	expect(within(boundary).getByRole('radio', { name: 'On' })).toHaveFocus();
	await user.keyboard('{ArrowLeft}');
	expect(within(boundary).getByRole('radio', { name: 'In' })).toBeChecked();
	expect(submissions).toHaveLength(0);
});

test('switching views or leaving the page discards unsaved quick-add drafts while full Create stays available', async () => {
	const user = renderList(
		<MemoryRouter initialEntries={['/issues']}>
			<Routes>
				<Route
					path='/issues'
					element={
						<>
							<Link to='/away'>Leave page</Link>
							<ProjectIssues />
						</>
					}
				/>
				<Route path='/away' element={<Link to='/issues'>Return to issues</Link>} />
			</Routes>
		</MemoryRouter>,
	);
	const quickAdd = screen.getByRole('form', { name: 'Quick-create issue' });
	expect(screen.getByRole('button', { name: 'Create Issue' })).toBeInTheDocument();
	await user.type(
		within(quickAdd).getByRole('textbox', { name: 'Issue name' }),
		'Discard on view switch',
	);
	await user.type(
		within(quickAdd).getByRole('textbox', { name: 'Description' }),
		'Unsaved description',
	);
	await user.click(within(quickAdd).getByRole('radio', { name: 'Fact' }));
	await user.click(within(quickAdd).getByRole('radio', { name: 'Out' }));
	await user.click(screen.getByRole('button', { name: 'Board view' }));
	expect(screen.queryByRole('form', { name: 'Quick-create issue' })).not.toBeInTheDocument();
	await user.click(screen.getByRole('button', { name: 'List view' }));
	const nextQuickAdd = screen.getByRole('form', { name: 'Quick-create issue' });
	expect(within(nextQuickAdd).getByRole('textbox', { name: 'Issue name' })).toHaveValue('');
	expect(within(nextQuickAdd).getByRole('textbox', { name: 'Description' })).toHaveValue('');
	expect(within(nextQuickAdd).getByRole('radio', { name: 'Unassigned' })).toBeChecked();
	expect(within(nextQuickAdd).getByRole('radio', { name: 'In' })).toBeChecked();
	await user.type(
		within(nextQuickAdd).getByRole('textbox', { name: 'Issue name' }),
		'Discard on navigation',
	);
	await user.type(
		within(nextQuickAdd).getByRole('textbox', { name: 'Description' }),
		'Another description',
	);
	await user.click(screen.getByRole('link', { name: 'Leave page' }));
	expect(screen.queryByRole('form', { name: 'Quick-create issue' })).not.toBeInTheDocument();
	expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	await user.click(screen.getByRole('link', { name: 'Return to issues' }));
	const returnedQuickAdd = screen.getByRole('form', { name: 'Quick-create issue' });
	expect(within(returnedQuickAdd).getByRole('textbox', { name: 'Issue name' })).toHaveValue('');
	expect(within(returnedQuickAdd).getByRole('textbox', { name: 'Description' })).toHaveValue('');
	expect(submissions).toHaveLength(0);
});

test('pending creation keeps the draft and rejects rapid button and keyboard duplicates', async () => {
	let finish!: () => void;
	let attempts = 0;
	apiClient.defaults.adapter = async config => {
		if (config.method === 'post') {
			attempts += 1;
			await new Promise<void>(resolve => {
				finish = resolve;
			});
		}
		return adapter(config);
	};
	const user = renderList();
	const name = screen.getByRole('textbox', { name: 'Issue name' });
	const description = screen.getByRole('textbox', { name: 'Description' });
	await user.type(name, 'Pending issue');
	await user.type(description, 'Keep this until confirmed');
	await user.dblClick(screen.getByRole('button', { name: 'Create issue' }));
	await waitFor(() => expect(attempts).toBe(1));
	expect(name).toHaveValue('Pending issue');
	expect(description).toHaveValue('Keep this until confirmed');
	expect(screen.getByRole('button', { name: 'Create issue' })).toBeDisabled();
	expect(screen.getByRole('button', { name: 'Create issue' })).toHaveAttribute(
		'aria-busy',
		'true',
	);
	fireEvent.keyDown(description, { key: 'Enter' });
	fireEvent.submit(screen.getByRole('form', { name: 'Quick-create issue' }));
	await act(async () => {});
	expect(attempts).toBe(1);
	expect(screen.queryByRole('table')).not.toBeInTheDocument();
	await act(async () => finish());
	expect(await screen.findByText('Pending issue')).toBeInTheDocument();
	await waitFor(() => expect(name).toHaveValue(''));
	expect(description).toHaveValue('');
	expect(name).toHaveFocus();
	expect(submissions).toHaveLength(1);
});

test('failed creation reports the existing error and preserves the entire draft for retry', async () => {
	apiClient.defaults.adapter = async config => {
		if (config.method === 'post') throw new Error('Network unavailable');
		return adapter(config);
	};
	const user = renderList();
	const name = screen.getByRole('textbox', { name: 'Issue name' });
	const description = screen.getByRole('textbox', { name: 'Description' });
	await user.click(screen.getByRole('radio', { name: 'Decision' }));
	await user.click(screen.getByRole('radio', { name: 'Out' }));
	await user.type(name, ' Draft decision ');
	await user.type(description, ' First paragraph {Shift>}{Enter}{/Shift} Second paragraph ');
	await user.keyboard('{Enter}');
	expect(await screen.findByText('Failed to create issue')).toBeInTheDocument();
	await waitFor(() => expect(screen.getByRole('button', { name: 'Create issue' })).toBeEnabled());
	expect(name).toHaveValue(' Draft decision ');
	expect(description).toHaveValue(' First paragraph  Second paragraph ');
	expect(screen.getByRole('radio', { name: 'Decision' })).toBeChecked();
	expect(screen.getByRole('radio', { name: 'Out' })).toBeChecked();
	expect(screen.queryByRole('table')).not.toBeInTheDocument();
	expect(submissions).toHaveLength(0);
	apiClient.defaults.adapter = adapter;
	await user.click(screen.getByRole('button', { name: 'Create issue' }));
	expect(await screen.findByText('Draft decision')).toBeInTheDocument();
	await waitFor(() => expect(name).toHaveValue(''));
	expect(submissions).toHaveLength(1);
	expect(submissions[0]).toMatchObject({
		name: ' Draft decision ',
		description: ' First paragraph  Second paragraph ',
		type: 'Decision',
		boundary: 'out',
		decision: { type: 'Policy' },
		uncertainty: { is_key: false },
	});
});

test('successful creation highlights only the new issue in its influence-diagram group for exactly two seconds', async () => {
	let finish!: () => void;
	apiClient.defaults.adapter = async config => {
		if (config.method === 'post') {
			await new Promise<void>(resolve => {
				finish = resolve;
			});
		}
		return adapter(config);
	};
	savedIssues = [existingIssue()];
	const user = renderList();
	await user.click(screen.getByRole('radio', { name: 'Utility' }));
	await user.type(screen.getByRole('textbox', { name: 'Issue name' }), 'NPV');
	await user.type(screen.getByRole('textbox', { name: 'Description' }), 'Present value');
	await user.click(screen.getByRole('button', { name: 'Create issue' }));
	await waitFor(() => expect(finish).toBeTypeOf('function'));
	vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
	await act(async () => {
		finish();
		await vi.advanceTimersByTimeAsync(0);
	});
	const inDiagram = screen.getByRole('table', { name: 'Issues used in the influence diagram' });
	const row = within(inDiagram).getByText('NPV').closest('tr');
	const existingRow = screen.getByText('Existing issue').closest('tr');
	expect(row).toHaveClass('[&>td]:bg-primary-selected-highlight!');
	expect(existingRow).not.toHaveClass('[&>td]:bg-primary-selected-highlight!');
	await act(async () => {
		await vi.advanceTimersByTimeAsync(1999);
	});
	expect(row).toHaveClass('[&>td]:bg-primary-selected-highlight!');
	await act(async () => {
		await vi.advanceTimersByTimeAsync(1);
	});
	expect(row).not.toHaveClass('[&>td]:bg-primary-selected-highlight!');
	expect(within(inDiagram).getByText('NPV')).toBeInTheDocument();
});

test('Escape discards text and validation errors while retaining type and boundary for the next draft', async () => {
	const user = renderList();
	const name = screen.getByRole('textbox', { name: 'Issue name' });
	const description = screen.getByRole('textbox', { name: 'Description' });
	await user.click(screen.getByRole('radio', { name: 'Fact' }));
	await user.click(screen.getByRole('radio', { name: 'On' }));
	await user.type(name, 'Unsaved fact');
	await user.click(description);
	await user.keyboard('{Enter}');
	expect(await screen.findByText('Issue description is required')).toBeInTheDocument();
	await user.keyboard('{Escape}');
	expect(name).toHaveValue('');
	expect(description).toHaveValue('');
	expect(screen.queryByText('Issue description is required')).not.toBeInTheDocument();
	expect(screen.getByRole('radio', { name: 'Fact' })).toBeChecked();
	expect(screen.getByRole('radio', { name: 'On' })).toBeChecked();
	expect(name).toHaveFocus();
	await user.type(name, 'Another unsaved fact');
	await user.type(description, 'Unsaved description{Escape}');
	expect(name).toHaveValue('');
	expect(description).toHaveValue('');
	expect(submissions).toHaveLength(0);
});

test('rapidly created issues keep independent two-second highlights', async () => {
	let finish!: () => void;
	let firstRequest = true;
	apiClient.defaults.adapter = async config => {
		if (config.method === 'post' && firstRequest) {
			firstRequest = false;
			await new Promise<void>(resolve => {
				finish = resolve;
			});
		}
		return adapter(config);
	};
	const user = renderList();
	const name = screen.getByRole('textbox', { name: 'Issue name' });
	const description = screen.getByRole('textbox', { name: 'Description' });
	await user.type(name, 'First captured issue');
	await user.type(description, 'First description');
	await user.click(screen.getByRole('button', { name: 'Create issue' }));
	await waitFor(() => expect(finish).toBeTypeOf('function'));
	vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
	await act(async () => {
		finish();
		await vi.advanceTimersByTimeAsync(0);
	});
	const firstRow = screen.getByText('First captured issue').closest('tr');
	expect(firstRow).toHaveClass('[&>td]:bg-primary-selected-highlight!');
	await act(async () => {
		await vi.advanceTimersByTimeAsync(1000);
	});
	fireEvent.change(name, { target: { value: 'Second captured issue' } });
	fireEvent.change(description, { target: { value: 'Second description' } });
	await act(async () => {
		fireEvent.submit(screen.getByRole('form', { name: 'Quick-create issue' }));
		await vi.advanceTimersByTimeAsync(0);
	});
	const secondRow = screen.getByText('Second captured issue').closest('tr');
	expect(secondRow).toHaveClass('[&>td]:bg-primary-selected-highlight!');
	expect(firstRow).toHaveClass('[&>td]:bg-primary-selected-highlight!');
	await act(async () => {
		await vi.advanceTimersByTimeAsync(999);
	});
	expect(firstRow).toHaveClass('[&>td]:bg-primary-selected-highlight!');
	await act(async () => {
		await vi.advanceTimersByTimeAsync(1);
	});
	expect(firstRow).not.toHaveClass('[&>td]:bg-primary-selected-highlight!');
	expect(secondRow).toHaveClass('[&>td]:bg-primary-selected-highlight!');
	await act(async () => {
		await vi.advanceTimersByTimeAsync(999);
	});
	expect(secondRow).toHaveClass('[&>td]:bg-primary-selected-highlight!');
	await act(async () => {
		await vi.advanceTimersByTimeAsync(1);
	});
	expect(secondRow).not.toHaveClass('[&>td]:bg-primary-selected-highlight!');
	expect(submissions).toHaveLength(2);
});

test.each([
	['Unassigned', 'In', 'Issues filtered out'],
	['Decision', 'In', 'Issues filtered out'],
	['Decision', 'On', 'Issues filtered out'],
	['Uncertainty', 'In', 'Issues filtered out'],
	['Uncertainty', 'On', 'Issues filtered out'],
	['Fact', 'In', 'Issues filtered out'],
	['Utility', 'In', 'Issues used in the influence diagram'],
	['Utility', 'On', 'Issues used in the influence diagram'],
	['Utility', 'Out', 'Issues filtered out'],
])(
	'places a new %s issue with boundary %s in %s using Policy/not-key defaults',
	async (type, boundary, group) => {
		const user = renderList();
		await user.click(screen.getByRole('radio', { name: type }));
		await user.click(screen.getByRole('radio', { name: boundary }));
		await user.type(screen.getByRole('textbox', { name: 'Issue name' }), 'Captured matter');
		await user.type(
			screen.getByRole('textbox', { name: 'Description' }),
			'Relevant to this decision',
		);
		await user.click(screen.getByRole('button', { name: 'Create issue' }));
		const table = await screen.findByRole('table', { name: group });
		expect(within(table).getByText('Captured matter')).toBeInTheDocument();
		await waitFor(() =>
			expect(screen.getByRole('textbox', { name: 'Issue name' })).toHaveFocus(),
		);
		expect(submissions[0]).toMatchObject({
			type,
			boundary: boundary.toLowerCase(),
			decision: { type: 'Policy', options: [] },
			uncertainty: { is_key: false, outcomes: [] },
		});
	},
);
