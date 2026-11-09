import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toaster, toast } from 'sonner';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { apiClient } from '../../../api';
import { project } from '../../../test/issueFixtures';
import { Objective, objectiveSchema } from '../../../validators';
import { ProjectContext } from '../ProjectContext';
import { ProjectObjectives } from './ProjectObjectives';

vi.mock('../../../api', () => ({
	apiClient: { get: vi.fn(), put: vi.fn() },
}));

const original: Objective = {
	id: '00000000-0000-4000-8000-000000000002',
	project_id: project.id,
	name: 'Reduce emissions',
	description: 'First paragraph\nSecond paragraph',
	type: 'Fundamental',
	ordering: 2,
	created_at: '2026-10-01T00:00:00Z',
	updated_at: '2026-10-02T00:00:00Z',
};

let savedObjectives: Objective[];

beforeEach(() => {
	savedObjectives = [structuredClone(original)];
	vi.mocked(apiClient.get).mockImplementation(async () => ({
		data: structuredClone(savedObjectives),
	}));
	vi.mocked(apiClient.put).mockImplementation(async (_url, body) => {
		const updates = objectiveSchema.array().parse(body);
		savedObjectives = savedObjectives.map(
			objective => updates.find(update => update.id === objective.id) ?? objective,
		);
		return { data: updates };
	});
});

afterEach(() => {
	toast.dismiss();
	vi.clearAllMocks();
});

const renderObjectives = () => {
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	client.setQueryData(['objectives'], structuredClone(savedObjectives));
	render(
		<QueryClientProvider client={client}>
			<ProjectContext value={project}>
				<ProjectObjectives />
			</ProjectContext>
			<Toaster />
		</QueryClientProvider>,
	);
	return userEvent.setup();
};

const table = () => within(screen.getByRole('table', { name: 'Objectives' }));

test('uses the shared text editors and type chip without changing dates or row actions', () => {
	renderObjectives();

	expect(table().getByRole('button', { name: /^Edit objective name:/ })).toHaveClass(
		'eds-button',
		'group',
		'h-12!',
	);
	expect(table().getByRole('button', { name: /^Edit objective description:/ })).toHaveClass(
		'eds-button',
		'group',
		'h-12!',
	);
	expect(table().getByRole('button', { name: 'Objective type: Fundamental' })).toHaveClass(
		'eds-chip',
	);
	expect(table().queryByRole('textbox')).not.toBeInTheDocument();
	expect(table().getByText('2026-10-01')).toBeInTheDocument();
	expect(table().getByText('2026-10-02')).toBeInTheDocument();
	expect(table().getByRole('button', { name: 'Move Reduce emissions up' })).toBeDisabled();
	expect(table().getByRole('button', { name: 'Move Reduce emissions down' })).toBeDisabled();
});

test.each([
	{ field: 'name', saveWith: 'Enter' },
	{ field: 'description', saveWith: 'Enter' },
	{ field: 'name', saveWith: 'blur' },
	{ field: 'description', saveWith: 'blur' },
] as const)(
	'saves $field once on $saveWith without changing other data',
	async ({ field, saveWith }) => {
		const user = renderObjectives();
		await user.click(
			table().getByRole('button', { name: new RegExp(`^Edit objective ${field}:`) }),
		);
		const input = table().getByRole('textbox', { name: `Objective ${field}` });
		expect(input).toHaveFocus();
		expect(input).toHaveValue(original[field]);
		await user.clear(input);
		await user.type(input, ' Updated value ');
		if (saveWith === 'Enter') await user.keyboard('{Enter}{Enter}');
		await user.click(screen.getByRole('heading', { name: 'Objectives' }));

		await waitFor(() =>
			expect(apiClient.put).toHaveBeenCalledExactlyOnceWith('/objectives', [
				{ ...original, [field]: ' Updated value ' },
			]),
		);
		expect(
			await table().findByRole('button', { name: `Edit objective ${field}: Updated value` }),
		).toBeInTheDocument();
		expect(await screen.findByText('Objective updated')).toBeInTheDocument();
	},
);

test('descriptions support Shift+Enter newlines before Enter saves', async () => {
	const user = renderObjectives();
	await user.click(table().getByRole('button', { name: /^Edit objective description:/ }));
	const input = table().getByRole('textbox', { name: 'Objective description' });
	expect(input.tagName).toBe('TEXTAREA');
	await user.clear(input);
	await user.type(input, ' First line{Shift>}{Enter}{/Shift}Second line ');
	expect(input).toHaveValue(' First line\nSecond line ');
	expect(apiClient.put).not.toHaveBeenCalled();
	await user.keyboard('{Enter}');

	await waitFor(() =>
		expect(apiClient.put).toHaveBeenCalledExactlyOnceWith('/objectives', [
			{ ...original, description: ' First line\nSecond line ' },
		]),
	);
});

test.each(['name', 'description'] as const)(
	'Escape discards the %s draft, restores focus, and does not save on blur',
	async field => {
		const user = renderObjectives();
		const label = new RegExp(`^Edit objective ${field}:`);
		await user.click(table().getByRole('button', { name: label }));
		const input = table().getByRole('textbox', { name: `Objective ${field}` });
		await user.clear(input);
		await user.type(input, 'Discard this change');
		await user.keyboard('{Escape}');

		const trigger = table().getByRole('button', { name: label });
		expect(trigger).toHaveFocus();
		expect(trigger).not.toHaveTextContent('Discard this change');
		await user.click(screen.getByRole('heading', { name: 'Objectives' }));
		expect(apiClient.put).not.toHaveBeenCalled();
		await user.click(trigger);
		expect(table().getByRole('textbox', { name: `Objective ${field}` })).toHaveValue(
			original[field],
		);
	},
);

test.each([
	{ field: 'name', message: 'Objective name is required' },
	{ field: 'description', message: 'Description is required' },
] as const)(
	'keeps an empty $field editable with validation feedback',
	async ({ field, message }) => {
		const user = renderObjectives();
		await user.click(
			table().getByRole('button', { name: new RegExp(`^Edit objective ${field}:`) }),
		);
		const input = table().getByRole('textbox', { name: `Objective ${field}` });
		await user.clear(input);
		await user.keyboard('{Enter}');

		await waitFor(() => expect(input).toHaveAttribute('aria-invalid', 'true'));
		expect(input).toHaveAccessibleDescription(new RegExp(message));
		expect(table().getByText(/Esc to cancel/)).toBeInTheDocument();
		await user.click(screen.getByRole('heading', { name: 'Objectives' }));
		expect(table().getByRole('textbox', { name: `Objective ${field}` })).toBeInTheDocument();
		expect(apiClient.put).not.toHaveBeenCalled();
		await user.type(input, 'Corrected value{Enter}');

		await waitFor(() =>
			expect(apiClient.put).toHaveBeenCalledExactlyOnceWith('/objectives', [
				{ ...original, [field]: 'Corrected value' },
			]),
		);
	},
);

test('does not save unchanged text or a type menu opened and dismissed', async () => {
	const user = renderObjectives();
	for (const field of ['name', 'description']) {
		await user.click(
			table().getByRole('button', { name: new RegExp(`^Edit objective ${field}:`) }),
		);
		await user.keyboard('{Enter}');
		await waitFor(() => expect(table().queryByRole('textbox')).not.toBeInTheDocument());
	}
	await user.click(table().getByRole('button', { name: 'Objective type: Fundamental' }));
	const menu = screen.getByRole('menu', { name: 'OBJECTIVE TYPE' });
	expect(within(menu).getByRole('menuitem', { name: 'Fundamental' })).toHaveAttribute(
		'aria-current',
		'true',
	);
	await user.click(within(menu).getByRole('menuitem', { name: 'Fundamental' }));
	expect(apiClient.put).not.toHaveBeenCalled();
});

test('type changes use the shared chip menu and exclude canceled text edits', async () => {
	const user = renderObjectives();
	await user.click(table().getByRole('button', { name: /^Edit objective name:/ }));
	const input = table().getByRole('textbox', { name: 'Objective name' });
	await user.clear(input);
	await user.keyboard('{Escape}');
	await user.click(table().getByRole('button', { name: 'Objective type: Fundamental' }));
	await user.click(
		within(screen.getByRole('menu', { name: 'OBJECTIVE TYPE' })).getByRole('menuitem', {
			name: 'Strategic',
		}),
	);

	await waitFor(() =>
		expect(apiClient.put).toHaveBeenCalledExactlyOnceWith('/objectives', [
			{ ...original, type: 'Strategic' },
		]),
	);
	expect(
		await table().findByRole('button', { name: 'Objective type: Strategic' }),
	).toBeInTheDocument();
});

test.each(['name', 'description'] as const)(
	'failed %s saves show an error and reopen the persisted value',
	async field => {
		vi.mocked(apiClient.put).mockRejectedValueOnce(new Error('Save unavailable'));
		const user = renderObjectives();
		const label = new RegExp(`^Edit objective ${field}:`);
		await user.click(table().getByRole('button', { name: label }));
		const input = table().getByRole('textbox', { name: `Objective ${field}` });
		await user.clear(input);
		await user.type(input, 'Failed attempt{Enter}');

		expect(await screen.findByText('Failed to update objective')).toBeInTheDocument();
		expect(screen.queryByText('Objective updated')).not.toBeInTheDocument();
		await waitFor(() =>
			expect(table().getByRole('button', { name: label })).not.toHaveTextContent(
				'Failed attempt',
			),
		);
		await user.click(table().getByRole('button', { name: label }));
		expect(table().getByRole('textbox', { name: `Objective ${field}` })).toHaveValue(
			original[field],
		);
		expect(apiClient.put).toHaveBeenCalledTimes(1);
	},
);
