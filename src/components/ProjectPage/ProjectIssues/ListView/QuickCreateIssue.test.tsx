import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { QuickCreateIssue } from './QuickCreateIssue';

const dependencies = vi.hoisted(() => ({
	project: { id: '283bf753-9979-4d82-a0b8-87d4c8cdd55f' },
	issues: [],
	createIssue: vi.fn(),
	updateIssue: vi.fn(),
	updateIssueOptimistic: vi.fn(),
}));

vi.mock('../../ProjectContext', () => ({
	useSelectedProject: () => dependencies.project,
}));

vi.mock('../../../../hooks/api/useGetIssues', () => ({
	useGetIssues: () => ({ issues: dependencies.issues }),
}));

vi.mock('../../../../hooks/api/useCreateIssue', () => ({
	useCreateIssue: () => ({ mutate: dependencies.createIssue, isPending: false }),
}));

vi.mock('../../../../hooks/api/useUpdateIssue', () => ({
	useUpdateIssue: () => ({ mutate: dependencies.updateIssue, isPending: false }),
}));

vi.mock('../../../../hooks/api/useUpdateIssues', () => ({
	useUpdateIssuesOptimistic: () => ({
		mutate: dependencies.updateIssueOptimistic,
		isPending: false,
	}),
}));

test('updates create-button validity while typing without submitting or blurring', async () => {
	const user = userEvent.setup();
	render(<QuickCreateIssue onCreated={vi.fn()} />);
	const button = screen.getByRole('button', { name: 'Create issue' });
	const name = screen.getByRole('textbox', { name: 'Issue name' });
	const description = screen.getByRole('textbox', { name: 'Description' });
	expect(button).toBeDisabled();
	await user.type(name, 'A new issue');
	expect(button).toBeDisabled();
	await user.type(description, 'Description of the issue');
	await waitFor(() => expect(button).toBeEnabled());
	await user.clear(description);
	await waitFor(() => expect(button).toBeDisabled());
	await user.type(description, 'Another description');
	await waitFor(() => expect(button).toBeEnabled());
});
