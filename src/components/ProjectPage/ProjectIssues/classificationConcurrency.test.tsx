import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosAdapter } from 'axios';
import { Provider } from 'jotai';
import { Toaster, toast } from 'sonner';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { apiClient } from '../../../api';
import { existingIssue, project } from '../../../test/issueFixtures';
import { Issue } from '../../../validators';
import { ProjectContext } from '../ProjectContext';
import { TableView } from './TableView/TableView';

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
		[savedIssue] = JSON.parse(config.data);
		requests.push(structuredClone(savedIssue));
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
	await user.click(await screen.findByRole('button', { name: '1 States' }));
	return user;
};

test.each([
	['Decision', 'add'],
	['Decision', 'remove'],
	['Uncertainty', 'add'],
	['Uncertainty', 'remove'],
] as const)(
	'a pending %s state %s blocks classification without disabling issue text editing',
	async (type, operation) => {
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
		const stateType = type === 'Decision' ? 'option' : 'outcome';
		if (operation === 'add') {
			await user.click(screen.getByRole('button', { name: `Add ${stateType}` }));
			await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Added state{Enter}');
		} else {
			await user.click(screen.getByText(`Existing ${stateType}`));
			await user.click(screen.getByRole('button', { name: `Remove ${stateType}` }));
		}
		await waitFor(() => expect(requests).toHaveLength(1));
		const controls = [
			screen.getByRole('button', { name: `Issue type: ${type}` }),
			screen.getByRole('button', { name: 'Boundary: Out' }),
			screen.getByRole('button', {
				name: type === 'Decision' ? 'Decision type: Tactical' : 'Key uncertainty',
			}),
		];
		for (const control of controls) {
			expect(control).toBeDisabled();
			await user.click(control);
		}
		expect(screen.queryByRole('menu')).toBeNull();
		expect(requests).toHaveLength(1);
		const issueName = screen.getByRole('button', { name: 'Edit issue name: Existing issue' });
		expect(issueName).toBeEnabled();
		await user.click(issueName);
		expect(screen.getByRole('textbox', { name: 'Issue name' })).toBeEnabled();
		await user.keyboard('{Escape}');
		for (const control of controls) expect(control).toBeDisabled();
		expect(requests).toHaveLength(1);
		await act(async () => finish());
		await waitFor(() => {
			for (const control of controls) expect(control).toBeEnabled();
		});
		expect(requests).toHaveLength(1);
		if (operation === 'add') {
			expect(screen.getByText('Added state')).toBeInTheDocument();
			expect(screen.getByRole('button', { name: '2 States' })).toBeInTheDocument();
		} else {
			expect(screen.queryByText(`Existing ${stateType}`)).toBeNull();
			expect(screen.queryByRole('button', { name: /^\d+ States$/ })).toBeNull();
			expect(screen.getByRole('button', { name: `Add ${stateType}` })).toBeEnabled();
		}
	},
);
