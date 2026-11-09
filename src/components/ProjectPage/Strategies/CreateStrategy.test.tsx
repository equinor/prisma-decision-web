import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test, vi } from 'vitest';
import { Strategy } from '../../../validators';
import { CreateStrategy } from './CreateStrategy';
import { Strategies } from './Strategies';

const dependencies = vi.hoisted(() => ({
	project: { id: '283bf753-9979-4d82-a0b8-87d4c8cdd55f' },
	strategies: [] as Strategy[],
	createStrategy: vi.fn(),
	updateStrategy: vi.fn(),
}));

vi.mock('../ProjectContext', () => ({
	useSelectedProject: () => dependencies.project,
}));

vi.mock('../../../hooks/useSelectedProjectStrategies', () => ({
	useSelectedProjectStrategies: () => ({
		selectedStrategies: dependencies.strategies,
		isLoading: false,
	}),
}));

vi.mock('../../../hooks/api/useCreateStrategy', () => ({
	useCreateStrategyOptimistic: () => ({
		mutate: dependencies.createStrategy,
		isPending: false,
	}),
}));

vi.mock('../../../hooks/api/useUpdateStrategy', () => ({
	useUpdateStrategy: () => ({
		mutate: dependencies.updateStrategy,
		isPending: false,
	}),
}));

beforeEach(() => {
	dependencies.strategies = [];
	dependencies.createStrategy.mockReset();
	dependencies.updateStrategy.mockReset();
});

test('matches the issue quick-create layout', () => {
	render(<Strategies />);

	const form = screen.getByRole('form', { name: 'Create strategy' });
	const heading = screen.getByRole('heading', { name: 'Strategies' });
	const header = heading.closest('.grid');

	expect(header).toContainElement(form);
	expect(header).toHaveClass('grid', 'xl:grid-cols-[auto_1fr]');
	expect(form).toHaveClass('w-full');
	expect(form).not.toHaveClass('bg-background-default', 'shadow-tile', 'p-4');
	expect(screen.getByRole('textbox', { name: 'Strategy name' })).toHaveAttribute(
		'placeholder',
		'Strategy name (required)',
	);
	expect(screen.getByRole('textbox', { name: 'Rationale' })).toHaveAttribute(
		'placeholder',
		'Rationale (required)',
	);
	expect(screen.getByLabelText('Strategy icon color')).toBeInTheDocument();
	expect(screen.getByRole('button', { name: 'Strategy icon' })).toBeInTheDocument();
	expect(screen.getByRole('button', { name: 'Create strategy' })).toBeInTheDocument();
	expect(screen.queryByRole('button', { name: 'Create Strategy' })).not.toBeInTheDocument();
});

test('submits the existing strategy form values', async () => {
	const user = userEvent.setup();
	render(<CreateStrategy />);

	await user.type(screen.getByRole('textbox', { name: 'Strategy name' }), 'Optimize production');
	await user.type(
		screen.getByRole('textbox', { name: 'Rationale' }),
		'Balances production and cost',
	);
	await user.click(screen.getByRole('button', { name: 'Create strategy' }));

	await waitFor(() => expect(dependencies.createStrategy).toHaveBeenCalledTimes(1));
	expect(dependencies.createStrategy).toHaveBeenCalledWith(
		expect.objectContaining({
			project_id: dependencies.project.id,
			name: 'Optimize production',
			rationale: 'Balances production and cost',
			icon: 'flash',
			icon_color: '#007079',
		}),
	);
});
