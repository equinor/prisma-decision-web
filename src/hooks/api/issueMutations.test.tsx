import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { beforeEach, expect, test, vi } from 'vitest';
import { apiClient } from '../../api';
import { existingIssue } from '../../test/issueFixtures';
import { Issue, issueSchema } from '../../validators';
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

function deferred<Value>() {
	let resolve!: (value: Value) => void;
	let reject!: (reason: Error) => void;
	const promise = new Promise<Value>((done, fail) => {
		resolve = done;
		reject = fail;
	});
	return { promise, resolve, reject };
}

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
			board: useCreateIssue({ position: 'top', onSuccess: vi.fn() }),
		}),
		{ wrapper },
	);
	await act(async () => {
		result.current.create.mutate(first);
		result.current.update.mutate(first);
		result.current.bulk.mutate([first]);
		result.current.optimistic.mutate([first]);
		result.current.remove.mutate(first.id);
		result.current.board.mutate(first);
	});
	expect(writes).toEqual(['create']);
	for (let index = 0; index < 7; index++) {
		await act(async () => releases[index]());
		if (index < 6) await waitFor(() => expect(writes).toHaveLength(index + 2));
	}
	expect(writes).toEqual(['create', 'update', 'update', 'update', 'delete', 'update', 'create']);
	expect(peak).toBe(1);
});

test.each(['update', 'delete'] as const)(
	'a failed %s and a queued optimistic edit settle to the server state',
	async operation => {
		const { first, second, client, wrapper } = setup();
		let saved = [first, second];
		vi.mocked(apiClient.get).mockImplementation(async () => ({
			data: structuredClone(saved),
		}));
		const save = async (_url: string, data: unknown) => {
			const updates = issueSchema.array().parse(data);
			saved = saved.map(issue => updates.find(updated => updated.id === issue.id) ?? issue);
			return { data: updates };
		};
		const pending = deferred<{ data: Issue[] }>();
		if (operation === 'update') {
			vi.mocked(apiClient.put)
				.mockImplementationOnce(() => pending.promise)
				.mockImplementation(save);
		} else {
			vi.mocked(apiClient.delete).mockImplementation(() => pending.promise);
			vi.mocked(apiClient.put).mockImplementation(save);
		}
		const { result } = renderHook(
			() => {
				useQuery({
					queryKey: ['issues'],
					queryFn: async () => (await apiClient.get('/issues')).data,
				});
				return {
					update: useUpdateIssuesOptimistic(),
					remove: useDeleteIssue(),
				};
			},
			{ wrapper },
		);
		await act(async () => {
			if (operation === 'update')
				result.current.update.mutate([{ ...first, boundary: 'in' }]);
			else result.current.remove.mutate(first.id);
		});
		await act(async () => result.current.update.mutate([{ ...second, boundary: 'on' }]));
		await waitFor(() =>
			expect(
				client.getQueryData<Issue[]>(['issues'])?.find(issue => issue.id === second.id)
					?.boundary,
			).toBe('on'),
		);
		await act(async () => pending.reject(new Error('Save failed')));
		await waitFor(() => expect(client.isMutating()).toBe(0));
		expect(client.getQueryData<Issue[]>(['issues'])).toEqual([
			first,
			{ ...second, boundary: 'on' },
		]);
	},
);
