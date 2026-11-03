import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Toaster, toast } from 'sonner';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { apiClient } from '../../../../api';
import { existingIssue, project } from '../../../../test/issueFixtures';
import { IssueType, issueSchema } from '../../../../validators';
import { ProjectContext } from '../../../ProjectPage/ProjectContext';
import { IssueDraftCard } from '../IssueDraftCard';

vi.mock('../../../../api', () => ({
	apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}));

beforeEach(() => {
	vi.mocked(apiClient.get).mockResolvedValue({ data: [] });
	vi.mocked(apiClient.post).mockImplementation(async (_url, body) => ({
		data: issueSchema.array().parse(body),
	}));
});

afterEach(() => {
	toast.dismiss();
	vi.clearAllMocks();
});

const renderDraftCard = (issueType?: IssueType, position?: 'top' | 'bottom') => {
	const onClose = vi.fn();
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	const Example = () => {
		const [open, setOpen] = useState(true);
		return open ? (
			<IssueDraftCard
				issueType={issueType}
				position={position}
				onClose={() => {
					onClose();
					setOpen(false);
				}}
			/>
		) : null;
	};
	render(
		<QueryClientProvider client={queryClient}>
			<ProjectContext value={project}>
				<Example />
			</ProjectContext>
			<Toaster />
		</QueryClientProvider>,
	);
	return { user: userEvent.setup(), onClose, queryClient };
};

test('creates an issue outside the Board and closes only after creation succeeds', async () => {
	let finishCreation!: () => void;
	vi.mocked(apiClient.post).mockImplementationOnce(async (_url, body) => {
		const created = issueSchema.array().parse(body);
		await new Promise<void>(resolve => {
			finishCreation = resolve;
		});
		return { data: created };
	});
	const { user, onClose } = renderDraftCard();
	const draft = screen.getByRole('form', { name: 'NEW UNASSIGNED' });
	const name = within(draft).getByRole('textbox', { name: 'Name' });
	expect(name).toHaveFocus();
	expect(within(draft).getByRole('radio', { name: 'In' })).toBeChecked();
	await user.type(name, 'Standalone issue');
	await user.type(
		within(draft).getByRole('textbox', { name: 'Description' }),
		'First line{Enter}Second line',
	);
	await user.click(within(draft).getByRole('button', { name: 'Add' }));
	await waitFor(() => expect(apiClient.post).toHaveBeenCalledTimes(1));
	expect(onClose).not.toHaveBeenCalled();
	expect(name).toBeDisabled();
	expect(within(draft).getByRole('button', { name: 'Add' })).toBeDisabled();
	expect(apiClient.post).toHaveBeenCalledWith('/issues', [
		expect.objectContaining({
			project_id: project.id,
			type: 'Unassigned',
			boundary: 'in',
			name: 'Standalone issue',
			description: 'First line\nSecond line',
		}),
	]);
	await act(async () => finishCreation());
	await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
	expect(screen.queryByRole('form')).not.toBeInTheDocument();
});

test('retains a failed creation for retry without a caller-supplied submit handler', async () => {
	vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Creation unavailable'));
	const { user, onClose } = renderDraftCard('Fact');
	const draft = screen.getByRole('form', { name: 'NEW FACT' });
	await user.type(within(draft).getByRole('textbox', { name: 'Name' }), 'Licence period');
	await user.type(within(draft).getByRole('textbox', { name: 'Description' }), 'Expires in 2032');
	await user.click(within(draft).getByRole('radio', { name: 'Out' }));
	await user.click(within(draft).getByRole('button', { name: 'Add' }));
	expect(await screen.findByText('Failed to create issue')).toBeInTheDocument();
	expect(onClose).not.toHaveBeenCalled();
	expect(within(draft).getByRole('textbox', { name: 'Name' })).toHaveValue('Licence period');
	expect(within(draft).getByRole('textbox', { name: 'Description' })).toHaveValue(
		'Expires in 2032',
	);
	expect(within(draft).getByRole('radio', { name: 'Out' })).toBeChecked();
	await user.click(within(draft).getByRole('button', { name: 'Add' }));
	await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
	expect(apiClient.post).toHaveBeenCalledTimes(2);
	expect(vi.mocked(apiClient.post).mock.calls[1][1]).toEqual(
		vi.mocked(apiClient.post).mock.calls[0][1],
	);
	expect(screen.queryByRole('form')).not.toBeInTheDocument();
});

test('owns validation and keeps an incomplete draft open without creating an issue', async () => {
	const { user, onClose } = renderDraftCard();
	const draft = screen.getByRole('form', { name: 'NEW UNASSIGNED' });
	await user.type(within(draft).getByRole('textbox', { name: 'Name' }), '   ');
	await user.type(within(draft).getByRole('textbox', { name: 'Description' }), '   ');
	expect(within(draft).getByRole('button', { name: 'Add' })).toBeDisabled();
	fireEvent.submit(draft);
	await waitFor(() =>
		expect(within(draft).getByRole('textbox', { name: 'Name' })).toHaveAttribute(
			'aria-invalid',
			'true',
		),
	);
	expect(screen.getByRole('form')).toBe(draft);
	expect(apiClient.post).not.toHaveBeenCalled();
	expect(onClose).not.toHaveBeenCalled();
});

test.each([
	['top', -10],
	['bottom', -3],
] as const)(
	'owns %s placement using only issues in its project and column',
	async (position, order) => {
		const issues = [
			{ ...existingIssue(), order: -4 },
			{ ...existingIssue(), id: '00000000-0000-4000-8000-000000000003', order: -9 },
			{
				...existingIssue(),
				id: '00000000-0000-4000-8000-000000000004',
				type: 'Fact' as const,
				order: position === 'top' ? -100 : 100,
			},
			{
				...existingIssue(),
				id: '00000000-0000-4000-8000-000000000005',
				project_id: '00000000-0000-4000-8000-000000000099',
				order: position === 'top' ? -100 : 100,
			},
		];
		vi.mocked(apiClient.get).mockResolvedValue({ data: issues });
		const { user, queryClient, onClose } = renderDraftCard('Decision', position);
		await waitFor(() => expect(queryClient.getQueryData(['issues'])).toEqual(issues));
		const draft = screen.getByRole('form', { name: 'NEW DECISION' });
		await user.type(within(draft).getByRole('textbox', { name: 'Name' }), 'Placed decision');
		await user.type(
			within(draft).getByRole('textbox', { name: 'Description' }),
			'Place this issue',
		);
		await user.click(within(draft).getByRole('button', { name: 'Add' }));
		await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
		expect(apiClient.post).toHaveBeenCalledWith('/issues', [
			expect.objectContaining({ order }),
		]);
		expect(apiClient.put).not.toHaveBeenCalled();
	},
);

test.each(['top', 'bottom'] as const)(
	'starts an empty column at zero for %s placement',
	async position => {
		const { user, onClose } = renderDraftCard('Decision', position);
		const draft = screen.getByRole('form', { name: 'NEW DECISION' });
		await user.type(within(draft).getByRole('textbox', { name: 'Name' }), 'First decision');
		await user.type(
			within(draft).getByRole('textbox', { name: 'Description' }),
			'The first issue',
		);
		await user.click(within(draft).getByRole('button', { name: 'Add' }));
		await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
		expect(apiClient.post).toHaveBeenCalledWith('/issues', [
			expect.objectContaining({ order: 0 }),
		]);
		expect(apiClient.put).not.toHaveBeenCalled();
	},
);

test('uses the latest column order when submitting an already-open draft', async () => {
	const issues = [{ ...existingIssue(), order: 0 }];
	vi.mocked(apiClient.get).mockResolvedValue({ data: issues });
	const { user, queryClient, onClose } = renderDraftCard('Decision', 'top');
	await waitFor(() => expect(queryClient.getQueryData(['issues'])).toEqual(issues));
	const draft = screen.getByRole('form', { name: 'NEW DECISION' });
	await user.type(within(draft).getByRole('textbox', { name: 'Name' }), 'Latest decision');
	await user.type(within(draft).getByRole('textbox', { name: 'Description' }), 'Still editing');
	act(() => queryClient.setQueryData(['issues'], [{ ...issues[0], order: -7 }]));
	await user.click(within(draft).getByRole('button', { name: 'Add' }));
	await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
	expect(apiClient.post).toHaveBeenCalledWith('/issues', [
		expect.objectContaining({ order: -8 }),
	]);
	expect(apiClient.put).not.toHaveBeenCalled();
});
