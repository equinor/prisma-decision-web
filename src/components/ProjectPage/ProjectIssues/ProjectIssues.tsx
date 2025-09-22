import { Button, Icon } from '@equinor/eds-core-react';
import { category, view_column, view_list } from '@equinor/eds-icons';
import { useLocalStorage } from '@uidotdev/usehooks';
import '@xyflow/react/dist/style.css';
import { useToggleAll } from '../../../hooks/useExpandCard';
import { useSelectedProjectIssues } from '../../../hooks/useSelectedProjectIssues';
import { ProjectTabs } from '../ProjectTabs';
import { ScenarioSelector } from '../ScenarioSelector';
import { CreateIssues } from './CreateIssue';
import { DiagramView } from './DiagramView/DiagramView';
import { ListView } from './ListView/ListView';
import { TableView } from './TableView/TableView';

export const ProjectIssues = () => {
	const [issueView, setIssuesView] = useLocalStorage('issuesView', 'list');
	const { toggleAll, expandedCards } = useToggleAll();
	let IssueView = ListView;
	let activeView = 0;
	if (issueView === 'table') {
		IssueView = TableView;
		activeView = 1;
	}
	if (issueView === 'diagram') {
		IssueView = DiagramView;
		activeView = 2;
	}
	const issueIds = useSelectedProjectIssues().map(issue => issue.id);
	const shouldCollapse = expandedCards.size === issueIds.length;

	return (
		<div className='flex flex-col gap-4'>
			<div className='flex w-full items-center justify-between'>
				<ProjectTabs />
				<div className='flex items-center gap-4'>
					<ScenarioSelector />
					<CreateIssues />
					<Button variant='outlined' onClick={() => toggleAll(issueIds)}>
						{shouldCollapse ? 'Collapse All' : 'Expand All'}
					</Button>
					<Button.Toggle selectedIndexes={[activeView]}>
						<Button onClick={() => setIssuesView('list')}>
							<Icon data={view_list} />
						</Button>
						<Button onClick={() => setIssuesView('table')}>
							<Icon data={view_column} />
						</Button>
						<Button onClick={() => setIssuesView('diagram')}>
							<Icon data={category} />
						</Button>
					</Button.Toggle>
				</div>
			</div>
			<IssueView />
		</div>
	);
};
