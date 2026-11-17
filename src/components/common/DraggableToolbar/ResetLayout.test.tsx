import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, test, vi } from 'vitest';
import { ResetLayout } from './ResetLayout';

vi.mock('@xyflow/react', () => ({ useNodes: () => [{ id: 'node-1' }] }));
vi.mock('../../ProjectPage/ProjectContext', () => ({
	useSelectedProject: () => ({ id: 'project-1' }),
}));

afterEach(() => {
	localStorage.removeItem('influenceDiagramCustomPositions-project-1');
	localStorage.removeItem('influenceDiagramCustomPositions-project-2');
});

test('resets custom positions for the current project', async () => {
	localStorage.setItem(
		'influenceDiagramCustomPositions-project-1',
		JSON.stringify({ 'node-1': { x: 100, y: 200 } }),
	);
	localStorage.setItem(
		'influenceDiagramCustomPositions-project-2',
		JSON.stringify({ 'node-2': { x: 300, y: 400 } }),
	);
	const user = userEvent.setup();
	render(<ResetLayout />);
	const button = screen.getByRole('button', { name: 'Reset to automatic layout' });
	expect(button).toBeEnabled();
	await user.click(button);
	expect(JSON.parse(localStorage.getItem('influenceDiagramCustomPositions-project-1')!)).toEqual(
		{},
	);
	expect(JSON.parse(localStorage.getItem('influenceDiagramCustomPositions-project-2')!)).toEqual({
		'node-2': { x: 300, y: 400 },
	});
	expect(button).toBeDisabled();
});

test('is disabled when no displayed nodes have custom positions', () => {
	localStorage.setItem(
		'influenceDiagramCustomPositions-project-1',
		JSON.stringify({ 'other-node': { x: 100, y: 200 } }),
	);
	render(<ResetLayout />);
	expect(screen.getByRole('button', { name: 'Reset to automatic layout' })).toBeDisabled();
});
