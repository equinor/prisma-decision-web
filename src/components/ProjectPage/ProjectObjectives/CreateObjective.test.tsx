import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test, vi } from 'vitest';
import { CreateObjective } from './CreateObjective';
import { ProjectObjectives } from './ProjectObjectives';

const dependencies = vi.hoisted(() => ({
	project: { id: '283bf753-9979-4d82-a0b8-87d4c8cdd55f', name: 'Test project' },
	createObjective: vi.fn(),
	updateObjective: vi.fn(),
	isPending: false,
	onSuccess: () => {},
}));

vi.mock('../ProjectContext', () => ({
	useSelectedProject: () => dependencies.project,
}));

vi.mock('../../../hooks/useSelectedProjectObjectives', () => ({
	useSelectedProjectObjectives: () => ({
		selectedObjectives: [],
		isLoading: false,
	}),
}));

vi.mock('../../../hooks/api/useCreateObjective', () => ({
	useCreateObjectiveOptimistic: ({ onSuccess }: { onSuccess: () => void }) => {
		dependencies.onSuccess = onSuccess;
		return {
			mutate: dependencies.createObjective,
			isPending: dependencies.isPending,
		};
	},
}));

vi.mock('../../../hooks/api/useUpdateObjective', () => ({
	useUpdateObjective: () => ({
		mutate: dependencies.updateObjective,
		isPending: false,
	}),
}));

beforeEach(() => {
	dependencies.project.id = '283bf753-9979-4d82-a0b8-87d4c8cdd55f';
	dependencies.isPending = false;
	dependencies.createObjective.mockReset();
	dependencies.updateObjective.mockReset();
});

test('shows quick-create in the objectives header without opening a popup', () => {
	render(<ProjectObjectives />);

	const form = screen.getByRole('form', { name: 'Create objective' });
	const header = screen.getByRole('heading', { name: 'Objectives' }).closest('.grid');

	expect(header).toContainElement(form);
	expect(header).toHaveClass('grid', 'xl:grid-cols-[auto_1fr]');
	expect(form).toHaveClass('w-full');
	expect(screen.getByRole('textbox', { name: 'Objective name' })).toHaveAttribute(
		'placeholder',
		'Objective name (required)',
	);
	expect(screen.getByRole('textbox', { name: 'Description' })).toHaveAttribute(
		'placeholder',
		'Description (required)',
	);
	expect(screen.getByRole('radio', { name: 'Fundamental' })).toBeChecked();
	expect(screen.getByRole('button', { name: 'Create objective' })).toBeInTheDocument();
	expect(screen.queryByRole('button', { name: 'Create Objective' })).not.toBeInTheDocument();
	expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('updates create-button validity while typing without submitting or blurring', async () => {
	const user = userEvent.setup();
	render(<CreateObjective />);

	const button = screen.getByRole('button', { name: 'Create objective' });
	const name = screen.getByRole('textbox', { name: 'Objective name' });
	const description = screen.getByRole('textbox', { name: 'Description' });

	expect(button).toBeDisabled();
	await user.type(name, 'Reduce emissions');
	expect(button).toBeDisabled();
	await user.type(description, 'Lower the project carbon footprint');
	await waitFor(() => expect(button).toBeEnabled());
	await user.clear(description);
	await waitFor(() => expect(button).toBeDisabled());
	await user.type(description, 'Another description');
	await waitFor(() => expect(button).toBeEnabled());
});

test('submits the objective values and selected type with Enter', async () => {
	const user = userEvent.setup();
	render(<CreateObjective />);

	await user.type(screen.getByRole('textbox', { name: 'Objective name' }), 'Reduce emissions');
	await user.click(screen.getByRole('radio', { name: 'Strategic' }));
	await user.type(
		screen.getByRole('textbox', { name: 'Description' }),
		'Lower the project carbon footprint',
	);
	await waitFor(() =>
		expect(screen.getByRole('button', { name: 'Create objective' })).toBeEnabled(),
	);
	await user.keyboard('{Enter}');

	await waitFor(() => expect(dependencies.createObjective).toHaveBeenCalledTimes(1));
	expect(dependencies.createObjective).toHaveBeenCalledWith(
		expect.objectContaining({
			project_id: dependencies.project.id,
			name: 'Reduce emissions',
			description: 'Lower the project carbon footprint',
			type: 'Strategic',
			ordering: 0,
		}),
	);
	expect(dependencies.updateObjective).not.toHaveBeenCalled();
});

test('clears text but keeps the selected type after success so another objective can be added', async () => {
	const user = userEvent.setup();
	dependencies.createObjective.mockImplementation(() => dependencies.onSuccess());
	render(<CreateObjective />);

	const name = screen.getByRole('textbox', { name: 'Objective name' });
	const description = screen.getByRole('textbox', { name: 'Description' });
	const button = screen.getByRole('button', { name: 'Create objective' });

	await user.type(name, 'Reduce emissions');
	await user.type(description, 'Lower the project carbon footprint');
	await user.click(screen.getByRole('radio', { name: 'Strategic' }));
	await user.click(button);

	await waitFor(() => expect(name).toHaveValue(''));
	expect(description).toHaveValue('');
	expect(screen.getByRole('radio', { name: 'Strategic' })).toBeChecked();
	expect(button).toBeDisabled();
	expect(screen.getByRole('form', { name: 'Create objective' })).toBeVisible();

	await user.type(name, 'Reduce costs');
	await user.type(description, 'Lower the project operating costs');
	await user.click(button);

	await waitFor(() => expect(dependencies.createObjective).toHaveBeenCalledTimes(2));
	expect(dependencies.createObjective.mock.calls[1][0].type).toBe('Strategic');
	expect(screen.getByRole('radio', { name: 'Strategic' })).toBeChecked();
	expect(dependencies.createObjective.mock.calls[0][0].id).not.toBe(
		dependencies.createObjective.mock.calls[1][0].id,
	);
});

test('disables the form while creation is pending and retains the draft', async () => {
	const user = userEvent.setup();
	const { rerender } = render(<CreateObjective />);

	const name = screen.getByRole('textbox', { name: 'Objective name' });
	const description = screen.getByRole('textbox', { name: 'Description' });
	const button = screen.getByRole('button', { name: 'Create objective' });
	await user.type(name, 'Reduce emissions');
	await user.type(description, 'Lower the project carbon footprint');

	dependencies.isPending = true;
	rerender(<CreateObjective />);

	expect(name).toBeDisabled();
	expect(description).toBeDisabled();
	expect(screen.getByRole('radio', { name: 'Strategic' })).toBeDisabled();
	expect(button).toBeDisabled();
	expect(button).toHaveAttribute('aria-busy', 'true');
	await user.click(button);
	expect(dependencies.createObjective).not.toHaveBeenCalled();

	dependencies.isPending = false;
	rerender(<CreateObjective />);

	expect(name).toHaveValue('Reduce emissions');
	expect(description).toHaveValue('Lower the project carbon footprint');
	await waitFor(() => expect(button).toBeEnabled());
});

test('starts a fresh draft when switching projects', async () => {
	const user = userEvent.setup();
	const { rerender } = render(<ProjectObjectives />);

	await user.type(screen.getByRole('textbox', { name: 'Objective name' }), 'Reduce emissions');
	await user.type(
		screen.getByRole('textbox', { name: 'Description' }),
		'Lower the project carbon footprint',
	);
	await user.click(screen.getByRole('radio', { name: 'Strategic' }));

	dependencies.project.id = '47316930-583c-4a51-9ac8-945687341826';
	rerender(<ProjectObjectives />);

	expect(screen.getByRole('textbox', { name: 'Objective name' })).toHaveValue('');
	expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue('');
	expect(screen.getByRole('radio', { name: 'Fundamental' })).toBeChecked();
	expect(screen.getByRole('button', { name: 'Create objective' })).toBeDisabled();
	expect(dependencies.createObjective).not.toHaveBeenCalled();
});
