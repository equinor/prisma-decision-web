import { act, renderHook } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';
import { existingIssue } from '../test/issueFixtures';
import { Issue } from '../validators';
import { useIssueForm } from './useIssueForm';

const creation = vi.hoisted(() => ({
	onSuccess: () => {},
	position: undefined as 'top' | 'bottom' | undefined,
	mutate: vi.fn<(issue: Issue) => void>(),
}));

const updates = vi.hoisted(() => ({
	onSuccess: () => {},
	mutate: vi.fn<(issue: Issue) => void>(),
	optimistic: vi.fn<(issues: Issue[], options?: { onSuccess?: () => void }) => void>(),
}));

beforeEach(() => {
	creation.mutate.mockReset();
	updates.mutate.mockReset();
	updates.optimistic.mockReset();
});

vi.mock('../components/ProjectPage/ProjectContext', () => ({
	useSelectedProject: () => ({ id: '283bf753-9979-4d82-a0b8-87d4c8cdd55f' }),
}));

vi.mock('./api/useGetIssues', () => ({
	useGetIssues: () => ({ issues: [] }),
}));

vi.mock('./api/useCreateIssue', () => ({
	useCreateIssue: ({
		onSuccess,
		position,
	}: {
		onSuccess: () => void;
		position?: 'top' | 'bottom';
	}) => {
		creation.onSuccess = onSuccess;
		creation.position = position;
		return { mutate: creation.mutate, isPending: false };
	},
}));

vi.mock('./api/useUpdateIssue', () => ({
	useUpdateIssue: ({ onSuccess }: { onSuccess: () => void }) => {
		updates.onSuccess = onSuccess;
		return { mutate: updates.mutate, isPending: false };
	},
}));

vi.mock('./api/useUpdateIssues', () => ({
	useUpdateIssuesOptimistic: () => ({ mutate: updates.optimistic, isPending: false }),
}));

test.each([undefined, false, true])(
	'selects the update mutation with optimistic=%s',
	async optimistic => {
		const issue = existingIssue();
		const onSuccess = vi.fn();
		updates.mutate.mockImplementation(() => updates.onSuccess());
		updates.optimistic.mockImplementation((_issues, options) => options?.onSuccess?.());
		const { result } = renderHook(() => useIssueForm({ issue, optimistic, onSuccess }));
		act(() => result.current.setValue('name', 'Updated issue'));
		await act(async () => result.current.onSubmit());
		const updated = { ...issue, name: 'Updated issue' };
		if (optimistic) {
			expect(updates.optimistic).toHaveBeenCalledWith(
				[updated],
				expect.objectContaining({ onSuccess: expect.any(Function) }),
			);
			expect(updates.mutate).not.toHaveBeenCalled();
		} else {
			expect(updates.mutate).toHaveBeenCalledWith(updated);
			expect(updates.optimistic).not.toHaveBeenCalled();
		}
		expect(onSuccess).toHaveBeenCalledWith(issue.id);
		expect(creation.mutate).not.toHaveBeenCalled();
	},
);

test('resets to a fresh draft while retaining classification after creation', () => {
	const onSuccess = vi.fn();
	const { result } = renderHook(() => useIssueForm({ onSuccess }));
	const original = result.current.getValues();
	act(() => {
		result.current.setValue('name', 'A new issue');
		result.current.setValue('description', 'Description of the issue');
		result.current.setValue('type', 'Decision');
		result.current.setValue('boundary', 'out');
		result.current.setValue('decision.type', 'Focus');
	});
	act(() => creation.onSuccess());
	const draft = result.current.getValues();
	expect(draft).toMatchObject({
		name: '',
		description: '',
		type: 'Decision',
		boundary: 'out',
		project_id: original.project_id,
		decision: { type: 'Policy', options: [] },
		uncertainty: { outcomes: [] },
	});
	expect(draft.id).not.toBe(original.id);
	expect(draft.node.id).not.toBe(original.node.id);
	expect(draft.decision.issue_id).toBe(draft.id);
	expect(onSuccess).toHaveBeenCalledOnce();
	expect(onSuccess).toHaveBeenCalledWith(original.id);
});

test('submits creation through the shared form and reports the submitted ID', async () => {
	creation.mutate.mockImplementation(() => creation.onSuccess());
	const onSuccess = vi.fn();
	const { result } = renderHook(() => useIssueForm({ onSuccess }));
	const originalId = result.current.getValues('id');
	act(() => {
		result.current.setValue('name', 'A new issue');
		result.current.setValue('description', 'Description of the issue');
	});
	await act(async () => result.current.onSubmit());
	expect(creation.mutate).toHaveBeenCalledOnce();
	expect(creation.mutate).toHaveBeenCalledWith(
		expect.objectContaining({ id: originalId, name: 'A new issue' }),
	);
	expect(onSuccess).toHaveBeenCalledWith(originalId);
	expect(result.current.getValues('name')).toBe('');
});

test.each(['top', 'bottom'] as const)(
	'initializes a Board draft and delegates %s placement to shared creation',
	async position => {
		const { result } = renderHook(() => useIssueForm({ issueType: 'Decision', position }));
		expect(result.current.getValues('type')).toBe('Decision');
		expect(result.current.getValues('boundary')).toBe('in');
		expect(creation.position).toBe(position);
		act(() => {
			result.current.setValue('name', 'New decision');
			result.current.setValue('description', 'A Board decision');
		});
		const draft = result.current.getValues();
		await act(async () => result.current.onSubmit());
		expect(creation.mutate).toHaveBeenCalledWith(draft);
	},
);

test('retains the draft until creation succeeds', async () => {
	const onSuccess = vi.fn();
	const { result } = renderHook(() => useIssueForm({ onSuccess }));
	act(() => {
		result.current.setValue('name', 'A new issue');
		result.current.setValue('description', 'Description of the issue');
	});
	const draft = result.current.getValues();
	await act(async () => result.current.onSubmit());
	expect(result.current.getValues()).toEqual(draft);
	expect(onSuccess).not.toHaveBeenCalled();
	await act(async () => result.current.onSubmit());
	expect(creation.mutate).toHaveBeenCalledTimes(2);
});
