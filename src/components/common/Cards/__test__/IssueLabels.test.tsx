import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test, vi } from 'vitest';
import { apiClient } from '../../../../api';
import { existingIssue } from '../../../../test/issueFixtures';
import { issueTypeTones } from '../../../../utils/issueTypeTones';
import { Issue, issueTypes } from '../../../../validators';
import { BoundaryLabel } from '../BoundaryLabel';
import { DecisionTypeLabel } from '../DecisionTypeLabel';
import { IssueCard, IssueCardHeader } from '../IssueCard';
import { IssueTypeLabel } from '../IssueTypeLabel';
import { KeyLabel } from '../KeyLabel';

vi.hoisted(() => {
	vi.stubGlobal(
		'ResizeObserver',
		class {
			observe() {}
			unobserve() {}
			disconnect() {}
		},
	);
});

vi.mock('../../../../api', () => ({
	apiClient: { put: vi.fn() },
}));
vi.mock('../../EditIssueModal', () => ({ EditIssueModal: () => null }));
vi.mock('../../DeleteIssueDialog', () => ({ DeleteIssueDialog: () => null }));

beforeEach(() => {
	vi.clearAllMocks();
	vi.mocked(apiClient.put).mockResolvedValue({ data: [] });
});

test.each(issueTypes)('%s labels leave their background styling to the EDS tone', type => {
	const { container } = render(
		<>
			<IssueTypeLabel type={type} />
			<IssueTypeLabel type={type} onChange={vi.fn()} />
		</>,
	);

	const labels = container.querySelectorAll('.eds-chip');
	expect(labels).toHaveLength(2);
	for (const label of labels) {
		expect(label).toHaveAttribute('data-color-appearance', issueTypeTones[type]);
		expect(label).toHaveAttribute('data-variant', 'default');
		expect(label).not.toHaveClass('bg-(--eds-color-bg-canvas)!');
	}
});

test('labels without change handlers remain passive EDS chips', () => {
	render(
		<>
			<IssueTypeLabel type='Decision' />
			<BoundaryLabel boundary='on' />
			<DecisionTypeLabel type='Focus' />
			<KeyLabel isKey />
		</>,
	);

	expect(screen.queryByRole('menu')).not.toBeInTheDocument();
	for (const value of ['Decision', 'On', 'Focus', 'Key']) {
		const label = screen.getByText(value).closest('.eds-chip');
		expect(label?.tagName).toBe('BUTTON');
		expect(label).toHaveClass('pointer-events-none');
		expect(label).toHaveAttribute('tabindex', '-1');
	}
	expect(screen.getByText('On').closest('.eds-chip')).toHaveClass('outline-dashed!');
});

test.each([
	{
		label: 'Issue type: Decision',
		title: 'ISSUE TYPE',
		current: 'Decision',
		next: 'Uncertainty',
		renderLabel: (onChange: (value: string) => void) => (
			<IssueTypeLabel type='Decision' onChange={onChange} />
		),
	},
	{
		label: 'Boundary: In',
		title: 'BOUNDARY',
		current: 'In',
		next: 'Out',
		value: 'out',
		renderLabel: (onChange: (value: string) => void) => (
			<BoundaryLabel boundary='in' onChange={onChange} />
		),
	},
	{
		label: 'Decision type: Focus',
		title: 'DECISION TYPE',
		current: 'Focus',
		next: 'Policy',
		renderLabel: (onChange: (value: string) => void) => (
			<DecisionTypeLabel type='Focus' onChange={onChange} />
		),
	},
])('$label becomes editable through its change handler', async entry => {
	const onChange = vi.fn();
	const user = userEvent.setup();
	render(entry.renderLabel(onChange));

	await user.click(screen.getByRole('button', { name: entry.label }));
	const menu = screen.getByRole('menu', { name: entry.title });
	const current = within(menu).getByRole('menuitem', { name: entry.current });
	expect(current).toHaveAttribute('aria-current', 'true');
	await user.click(current);
	expect(onChange).not.toHaveBeenCalled();
	await user.click(screen.getByRole('button', { name: entry.label }));
	await user.click(
		within(screen.getByRole('menu', { name: entry.title })).getByRole('menuitem', {
			name: entry.next,
		}),
	);
	expect(onChange).toHaveBeenCalledExactlyOnceWith(entry.value ?? entry.next);
});

test.each([false, true])('editable key label toggles key=%s', async isKey => {
	const onChange = vi.fn();
	const user = userEvent.setup();
	render(<KeyLabel isKey={isKey} onChange={onChange} />);

	const label = screen.getByRole('button', { name: 'Key uncertainty' });
	expect(label).toHaveAttribute('aria-pressed', String(isKey));
	await user.click(label);
	expect(onChange).toHaveBeenCalledExactlyOnceWith(!isKey);
});

const renderHeader = (issue: Issue, editable?: boolean) => {
	const client = new QueryClient({
		defaultOptions: { mutations: { retry: false } },
	});
	client.setQueryData(['issues'], [issue]);
	render(
		<QueryClientProvider client={client}>
			<IssueCard issue={issue}>
				<IssueCardHeader editable={editable}>
					<button>Header action</button>
				</IssueCardHeader>
			</IssueCard>
		</QueryClientProvider>,
	);
	return userEvent.setup();
};

test('existing header defaults to read-only labels and retains its children', async () => {
	const user = renderHeader(existingIssue());

	await user.tab();
	expect(screen.getByRole('button', { name: 'Header action' })).toHaveFocus();
	expect(screen.getByText('Decision')).toBeInTheDocument();
	expect(screen.getByText('Out')).toBeInTheDocument();
	expect(screen.getByText('Tactical')).toBeInTheDocument();
	expect(apiClient.put).not.toHaveBeenCalled();
});

test.each([
	['Issue type: Decision', 'ISSUE TYPE', 'Fact'],
	['Boundary: Out', 'BOUNDARY', 'On'],
	['Decision type: Tactical', 'DECISION TYPE', 'Policy'],
])('editable header saves %s through the shared issue mutation', async (label, title, option) => {
	const issue = existingIssue();
	const user = renderHeader(issue, true);
	await user.click(screen.getByRole('button', { name: label }));
	await user.click(
		within(screen.getByRole('menu', { name: title })).getByRole('menuitem', { name: option }),
	);

	const updated =
		title === 'ISSUE TYPE'
			? { ...issue, type: 'Fact' }
			: title === 'BOUNDARY'
				? { ...issue, boundary: 'on' }
				: { ...issue, decision: { ...issue.decision, type: 'Policy' } };
	await waitFor(() =>
		expect(apiClient.put).toHaveBeenCalledExactlyOnceWith('/issues', [updated]),
	);
	expect(screen.getByRole('button', { name: label })).toBeEnabled();
	expect(screen.getByRole('button', { name: 'Header action' })).toBeInTheDocument();
});

test('editable uncertainty header saves key status and omits decision type', async () => {
	const issue: Issue = { ...existingIssue(), type: 'Uncertainty' };
	const user = renderHeader(issue, true);
	await user.click(screen.getByRole('button', { name: 'Key uncertainty' }));

	await waitFor(() =>
		expect(apiClient.put).toHaveBeenCalledExactlyOnceWith('/issues', [
			{ ...issue, uncertainty: { ...issue.uncertainty, is_key: false } },
		]),
	);
	expect(screen.queryByRole('button', { name: /Decision type:/ })).not.toBeInTheDocument();
});
