import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'jotai';
import { beforeEach, expect, test, vi } from 'vitest';
import { apiClient } from '../../../../api';
import { existingIssue, project } from '../../../../test/issueFixtures';
import { canDndStartFrom } from '../../../../utils/canDndStartFrom';
import { Issue } from '../../../../validators';
import { ProjectContext } from '../../../ProjectPage/ProjectContext';
import { IssueTextField } from '../../../ProjectPage/ProjectIssues/IssueTextField';
import { IssueCard, IssueCardEditMenuItem, IssueCardHeader, IssueCardMenu } from '../IssueCard';
import { IssueCardEditableStates } from '../IssueCardEditableStates';

vi.hoisted(() => {
	vi.stubGlobal(
		'ResizeObserver',
		class {
			observe() {}
			unobserve() {}
			disconnect() {}
		},
	);
	if (!globalThis.PointerEvent) vi.stubGlobal('PointerEvent', class extends MouseEvent {});
});
vi.mock('../../../../api', () => ({ apiClient: { get: vi.fn(), put: vi.fn() } }));
vi.mock('../../EditIssueModal', () => ({ EditIssueModal: () => null }));
vi.mock('../../DeleteIssueDialog', () => ({ DeleteIssueDialog: () => null }));

beforeEach(() => {
	vi.clearAllMocks();
	vi.mocked(apiClient.get).mockResolvedValue({ data: [] });
	vi.mocked(apiClient.put).mockResolvedValue({ data: [] });
});

const renderCard = (type: Issue['type'] = 'Decision') => {
	const issue = { ...existingIssue(), type };
	const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	client.setQueryData(['issues'], [issue]);
	render(
		<QueryClientProvider client={client}>
			<Provider>
				<ProjectContext value={project}>
					<IssueCard issue={issue}>
						<IssueCardHeader editable>
							<IssueCardMenu>
								<IssueCardEditMenuItem />
							</IssueCardMenu>
						</IssueCardHeader>
						<IssueTextField issue={issue} field='name' variant='card' />
						<IssueTextField issue={issue} field='description' variant='card' />
						<IssueCardEditableStates />
					</IssueCard>
				</ProjectContext>
			</Provider>
		</QueryClientProvider>,
	);
	return userEvent.setup();
};

test.each(['name', 'utility'] as const)(
	'state %s editing waits for release, not pointer focus',
	async field => {
		const user = renderCard();
		await user.click(screen.getByRole('button', { name: '1 States' }));
		const trigger = screen.getByRole('button', {
			name: `Edit option ${field}: Existing option`,
		});
		await user.pointer({ target: trigger, keys: '[MouseLeft>]' });
		expect(screen.queryByRole('textbox', { name: 'Name' })).not.toBeInTheDocument();
		await user.pointer({ keys: '[/MouseLeft]' });
		expect(
			screen.getByRole(field === 'name' ? 'textbox' : 'spinbutton', {
				name: field === 'name' ? 'Name' : 'Utility',
			}),
		).toHaveFocus();
	},
);

const actions = [
	/^Edit issue name:/,
	/^Edit issue description:/,
	'Issue type: Decision',
	'Boundary: Out',
	'Decision type: Tactical',
	'Issue actions',
	'1 States',
] as const;

test.each(actions)(
	'idle action %s permits dragging but does not activate after movement',
	label => {
		renderCard();
		const trigger = screen.getByRole('button', { name: label });
		expect(canDndStartFrom(trigger)).toBe(true);
		expect(trigger.closest('.nodrag')).toBeNull();
		fireEvent.pointerDown(trigger, { button: 0, clientX: 20, clientY: 20 });
		fireEvent.pointerMove(trigger, { clientX: 60, clientY: 20 });
		fireEvent.pointerUp(trigger, { button: 0, clientX: 60, clientY: 20 });
		fireEvent.click(trigger, { detail: 1, clientX: 60, clientY: 20 });
		expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
		expect(screen.queryByRole('menu')).not.toBeInTheDocument();
		expect(screen.queryByRole('button', { name: 'Add option' })).not.toBeInTheDocument();
		expect(apiClient.put).not.toHaveBeenCalled();
	},
);

test('a moved key uncertainty action does not save, while a subsequent click does', async () => {
	const user = renderCard('Uncertainty');
	const trigger = screen.getByRole('button', { name: 'Key uncertainty' });
	expect(canDndStartFrom(trigger)).toBe(true);
	fireEvent.pointerDown(trigger, { button: 0, clientX: 20, clientY: 20 });
	fireEvent.pointerMove(trigger, { clientX: 60, clientY: 20 });
	fireEvent.pointerUp(trigger, { button: 0, clientX: 60, clientY: 20 });
	fireEvent.click(trigger, { detail: 1, clientX: 60, clientY: 20 });
	expect(apiClient.put).not.toHaveBeenCalled();
	await user.click(trigger);
	expect(apiClient.put).toHaveBeenCalledOnce();
});

test('keyboard activation still edits and active inputs block dragging', async () => {
	const user = renderCard();
	screen.getByRole('button', { name: /^Edit issue description:/ }).focus();
	await user.keyboard('{Enter}');
	const input = screen.getByRole('textbox', { name: 'Issue description' });
	expect(input).toHaveFocus();
	expect(canDndStartFrom(input)).toBe(false);
	expect(input.closest('.nodrag')).not.toBeNull();
});
