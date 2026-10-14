import { Button, Icon } from '@equinor/eds-core-react';
import { layers, view_column, view_list } from '@equinor/eds-icons';
import { useLocalStorage } from '@uidotdev/usehooks';
import '@xyflow/react/dist/style.css';
import { CreateIssues } from '../../common/CreateIssue';
import { DecisionTypeView } from './DecisionTypeView/DecisionTypeView';
import { ListView } from './ListView/ListView';
import { TableView } from './TableView/TableView';
import { ToggleExpandAll } from '../ToggleExpandAll';
import { useSelectedProject } from '../ProjectContext';

export const ProjectIssues = () => {
	const [issueView, setIssuesView] = useLocalStorage('issuesView', 'list');
	const selectedProject = useSelectedProject();
	let IssueView = ListView;
	let activeView = 0;
	if (issueView === 'table') {
		IssueView = TableView;
		activeView = 1;
	} else if (issueView === 'decisionType') {
		IssueView = DecisionTypeView;
		activeView = 2;
	}

	return (
		<div className='flex flex-col gap-4'>
			<div className='flex items-center justify-between'>
				<h1 className='text-3xl font-bold'>{selectedProject.name}</h1>
				<div className='flex items-center gap-4'>
					<CreateIssues />
					{activeView === 1 && <ToggleExpandAll />}
					<Button.Toggle selectedIndexes={[activeView]}>
						<Button onClick={() => setIssuesView('list')}>
							<Icon data={view_list} />
						</Button>
						<Button onClick={() => setIssuesView('table')}>
							<Icon data={view_column} />
						</Button>
						<Button
							aria-label='Decision type view'
							onClick={() => setIssuesView('decisionType')}
						>
							<Icon data={layers} />
						</Button>
					</Button.Toggle>
				</div>
			</div>
			<IssueView />
		</div>
	);
};
