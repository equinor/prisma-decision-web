import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { beforeEach, expect, test, vi } from 'vitest';
import { apiClient } from '../../api';
import { existingIssue } from '../../test/issueFixtures';
import { Issue } from '../../validators';
import { useCreateIssue } from './useCreateIssue';
import { useDeleteIssue } from './useDeleteIssue';
import { useUpdateIssue } from './useUpdateIssue';
import { useUpdateIssues, useUpdateIssuesOptimistic } from './useUpdateIssues';

vi.mock('../../api', () => ({
	apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));
vi.mock('../../components/ShowToast', () => ({
	showErrorToast: vi.fn(),
	showSuccessToast: vi.fn(),
}));

const setup = () => {
	const first = existingIssue();
	const second: Issue = {
		...existingIssue(),
		id: '00000000-0000-4000-8000-000000000003',
		order: 0,
	};
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	client.setQueryData(['issues'], [first, second]);
	client.setQueryData(['edges'], []);
	const wrapper = ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={client}>{children}</QueryClientProvider>
	);
	return { first, second, client, wrapper };
};

beforeEach(() => {
	vi.resetAllMocks();
});

test('create, updates, delete and Board creation share one request queue', async () => {
	const { first, wrapper } = setup();
	const writes: string[] = [];
	let active = 0;
	let peak = 0;
	const releases: (() => void)[] = [];
	const request = (operation: string) => {
		writes.push(operation);
		peak = Math.max(peak, ++active);
		return new Promise<{ data: Issue[] }>(resolve => {
			releases.push(() => {
				active--;
				resolve({ data: [first] });
			});
		});
	};
	vi.mocked(apiClient.post).mockImplementation(() => request('create'));
	vi.mocked(apiClient.put).mockImplementation(() => request('update'));
	vi.mocked(apiClient.delete).mockImplementation(() => request('delete'));
	const { result } = renderHook(
		() => ({
			create: useCreateIssue({}),
			update: useUpdateIssue({}),
			bulk: useUpdateIssues(),
			optimistic: useUpdateIssuesOptimistic(),
			remove: useDeleteIssue(),
			board: useCreateIssue({ onSuccess: vi.fn() }),
		}),
		{ wrapper },
	);
	await act(async () => {
		result.current.create.mutate(first);
		result.current.update.mutate(first);
		result.current.bulk.mutate([first]);
		result.current.optimistic.mutate([first]);
		result.current.remove.mutate(first.id);
		result.current.board.mutate({ ...first, order: -1 });
	});
	expect(writes).toEqual(['create']);
	for (let index = 0; index < 6; index++) {
		await act(async () => releases[index]());
		if (index < 5) await waitFor(() => expect(writes).toHaveLength(index + 2));
	}
	expect(writes).toEqual(['create', 'update', 'update', 'update', 'delete', 'create']);
	expect(apiClient.post).toHaveBeenLastCalledWith('/issues', [{ ...first, order: -1 }]);
	expect(peak).toBe(1);
});
