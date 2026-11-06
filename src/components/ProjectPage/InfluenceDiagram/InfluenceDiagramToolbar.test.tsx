import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useNodes } from '@xyflow/react';
import { createStore, Provider } from 'jotai';
import { ReactNode } from 'react';
import { beforeEach, expect, test, vi } from 'vitest';
import { expandedCardsAtom } from '../../../hooks/useExpandCard';
import { useSelectedProjectIssues } from '../../../hooks/useSelectedProjectIssues';
import { existingIssue } from '../../../test/issueFixtures';
import { ReactFlowInfluenceNode } from '../../../types';
import { Issue } from '../../../validators';
import {
	IssueCard,
	IssueCardExpandableContent,
	IssueCardExpandTrigger,
	IssueCardStates,
} from '../../common/Cards/IssueCard';
import { InfluenceDiagramToolbar } from './InfluenceDiagramToolbar';

vi.mock('@xyflow/react', async importOriginal => ({
	...(await importOriginal<typeof import('@xyflow/react')>()),
	useNodes: vi.fn(),
}));
vi.mock('../../../hooks/useSelectedProjectIssues', () => ({
	useSelectedProjectIssues: vi.fn(),
}));
vi.mock('../../../hooks/useInfluenceDiagramEvidence', () => ({
	useInfluenceDiagramEvidence: () => ({ evidence: [] }),
}));
vi.mock('../ProjectContext', () => ({
	useSelectedProject: () => ({ id: 'project' }),
}));
vi.mock('../../common/CreateIssueToolbarButton', () => ({ CreateIssueToolbarButton: () => null }));
vi.mock('../../common/EVMetrics', () => ({ EVMetrics: () => null }));
vi.mock('../../common/DraggableToolbar/ZoomControls', () => ({ ZoomControls: () => null }));
vi.mock('../../common/DraggableToolbar/LayoutControls', () => ({ LayoutControls: () => null }));
vi.mock('../../common/DraggableToolbar/DeleteMenu', () => ({ DeleteMenu: () => null }));
vi.mock('../../common/DraggableToolbar/ChangeIssueType', () => ({ ChangeIssueType: () => null }));
vi.mock('../../common/DraggableToolbar/DraggableToolbar', () => ({
	DraggableToolbar: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock('../../common/EditIssueModal', () => ({ EditIssueModal: () => null }));
vi.mock('../../common/DeleteIssueDialog', () => ({ DeleteIssueDialog: () => null }));

const createIssue = (id: string, type: Issue['type']): Issue => ({
	...existingIssue(),
	id,
	type,
	boundary: 'in',
	decision: { ...existingIssue().decision, type: 'Focus' },
});
const issues = [
	createIssue('decision-issue', 'Decision'),
	createIssue('uncertainty-issue', 'Uncertainty'),
	createIssue('utility-issue', 'Utility'),
];
const toNode = (issue: Issue): ReactFlowInfluenceNode => ({
	id: `${issue.id}-node`,
	type: issue.type.toLowerCase(),
	position: { x: 0, y: 0 },
	data: { ...issue.node, issue_id: issue.id },
});
const nodes = issues.map(toNode);
const toolbarProps = {
	view: 'card',
	onViewChange: vi.fn(),
	tool: 'pan',
	onToolChange: vi.fn(),
} as const;

beforeEach(() => {
	vi.mocked(useNodes).mockReturnValue(nodes);
	vi.mocked(useSelectedProjectIssues).mockReturnValue(issues);
});

const renderToolbar = (expandedIds: string[] = []) => {
	const store = createStore();
	store.set(expandedCardsAtom, new Set(expandedIds));
	const view = render(
		<Provider store={store}>
			<InfluenceDiagramToolbar {...toolbarProps} />
			{issues
				.filter(issue => issue.type !== 'Utility')
				.map(issue => (
					<IssueCard key={issue.id} issue={issue}>
						<IssueCardExpandableContent />
						<IssueCardStates>
							<IssueCardExpandTrigger />
						</IssueCardStates>
					</IssueCard>
				))}
		</Provider>,
	);
	return { store, user: userEvent.setup(), ...view };
};

test('switches to Collapse All after manually expanding every expandable diagram node', async () => {
	const { user, store } = renderToolbar();
	const triggers = screen.getAllByRole('button', { name: '1 States' });

	expect(screen.getByRole('button', { name: 'Expand All' })).toBeEnabled();
	await user.click(triggers[0]);
	expect(screen.getByRole('button', { name: 'Expand All' })).toBeEnabled();
	await user.click(triggers[1]);
	expect(screen.getByRole('button', { name: 'Collapse All' })).toBeEnabled();
	expect(store.get(expandedCardsAtom)).toEqual(new Set(['decision-issue', 'uncertainty-issue']));

	await user.click(triggers[0]);
	expect(screen.getByRole('button', { name: 'Expand All' })).toBeEnabled();
});

test('expands only diagram nodes even when unrelated expanded cards have the same count', async () => {
	const { user, store } = renderToolbar(['other-page-issue', 'other-project-issue']);

	await user.click(screen.getByRole('button', { name: 'Expand All' }));
	expect(store.get(expandedCardsAtom)).toEqual(
		new Set(['other-page-issue', 'other-project-issue', 'decision-issue', 'uncertainty-issue']),
	);
	expect(screen.getByRole('button', { name: 'Collapse All' })).toBeEnabled();

	await user.click(screen.getByRole('button', { name: 'Collapse All' }));
	expect(store.get(expandedCardsAtom)).toEqual(
		new Set(['other-page-issue', 'other-project-issue']),
	);
	expect(screen.getByRole('button', { name: 'Expand All' })).toBeEnabled();
});

test('expands the remaining diagram nodes from a mixed state', async () => {
	const { user, store } = renderToolbar(['decision-issue']);

	await user.click(screen.getByRole('button', { name: 'Expand All' }));
	expect(store.get(expandedCardsAtom)).toEqual(new Set(['decision-issue', 'uncertainty-issue']));
	expect(screen.getByRole('button', { name: 'Collapse All' })).toBeEnabled();
});

test('recalculates the button when the displayed nodes change', () => {
	const { store, rerender } = renderToolbar(['decision-issue', 'uncertainty-issue']);
	expect(screen.getByRole('button', { name: 'Collapse All' })).toBeEnabled();

	const newIssue = createIssue('new-issue', 'Decision');
	vi.mocked(useNodes).mockReturnValue([...nodes, toNode(newIssue)]);
	vi.mocked(useSelectedProjectIssues).mockReturnValue([...issues, newIssue]);
	rerender(
		<Provider store={store}>
			<InfluenceDiagramToolbar {...toolbarProps} />
		</Provider>,
	);
	expect(screen.getByRole('button', { name: 'Expand All' })).toBeEnabled();
});

test('uses the shared diagram filter before checking expansion state', async () => {
	const filteredIssues = [
		createIssue('out-decision', 'Decision'),
		createIssue('tactical-decision', 'Decision'),
		createIssue('non-key-uncertainty', 'Uncertainty'),
		createIssue('out-uncertainty', 'Uncertainty'),
		createIssue('fact', 'Fact'),
		createIssue('unassigned', 'Unassigned'),
	];
	filteredIssues[0].boundary = 'out';
	filteredIssues[1].decision.type = 'Tactical';
	filteredIssues[2].uncertainty.is_key = false;
	filteredIssues[3].boundary = 'out';
	vi.mocked(useSelectedProjectIssues).mockReturnValue([...issues, ...filteredIssues]);
	vi.mocked(useNodes).mockReturnValue([...nodes, ...filteredIssues.map(toNode)]);

	const { user, store } = renderToolbar(['decision-issue', 'uncertainty-issue']);
	await user.click(screen.getByRole('button', { name: 'Collapse All' }));
	expect(store.get(expandedCardsAtom)).toEqual(new Set());

	await user.click(screen.getByRole('button', { name: 'Expand All' }));
	expect(store.get(expandedCardsAtom)).toEqual(new Set(['decision-issue', 'uncertainty-issue']));
	expect(screen.getByRole('button', { name: 'Collapse All' })).toBeEnabled();
});

test.each([
	{ diagram: 'empty', displayedNodes: [] },
	{ diagram: 'utility-only', displayedNodes: nodes.filter(node => node.type === 'utility') },
])('disables the action for a $diagram diagram', ({ displayedNodes }) => {
	vi.mocked(useNodes).mockReturnValue(displayedNodes);
	renderToolbar(['other-page-issue']);
	expect(screen.getByRole('button', { name: 'Expand All' })).toBeDisabled();
});
