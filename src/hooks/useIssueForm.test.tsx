import { act, renderHook } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';
import { Issue } from '../validators';
import { useIssueForm } from './useIssueForm';

const creation = vi.hoisted(() => ({
	onSuccess: () => {},
	mutate: vi.fn<(issue: Issue) => void>(),
}));

beforeEach(() => {
	creation.mutate.mockReset();
});

vi.mock('../components/ProjectPage/ProjectContext', () => ({
	useSelectedProject: () => ({ id: '283bf753-9979-4d82-a0b8-87d4c8cdd55f' }),
}));

vi.mock('./api/useGetIssues', () => ({
	useGetIssues: () => ({ issues: [] }),
}));

vi.mock('./api/useCreateIssue', () => ({
	useCreateIssue: ({ onSuccess }: { onSuccess: () => void }) => {
		creation.onSuccess = onSuccess;
		return { mutate: creation.mutate, isPending: false };
	},
}));

vi.mock('./api/useUpdateIssue', () => ({
	useUpdateIssue: () => ({ mutate: vi.fn(), isPending: false }),
}));

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
