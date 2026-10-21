import { Button, Icon } from '@equinor/eds-core-react/next';
import { view_column, view_list } from '@equinor/eds-icons';
import { useLocalStorage } from '@uidotdev/usehooks';
import '@xyflow/react/dist/style.css';
import { CreateIssueButton } from '../../common/CreateIssueButton';
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
	}

	return (
		<div className='flex flex-col gap-4'>
			<div className='grid w-full grid-cols-[1fr_auto] items-center justify-between gap-2'>
				<h1 className='truncate text-3xl font-bold'>{selectedProject.name}</h1>
				<div className='flex items-center gap-4'>
					<CreateIssueButton />
					{activeView !== 0 && <ToggleExpandAll />}
					<div role='group' aria-label='Issues view' className='flex gap-1'>
						<Button
							icon
							aria-label='List view'
							aria-pressed={activeView === 0}
							variant={activeView === 0 ? 'primary' : 'secondary'}
							onClick={() => setIssuesView('list')}
						>
							<Icon data={view_list} />
						</Button>
						<Button
							icon
							aria-label='Board view'
							aria-pressed={activeView === 1}
							variant={activeView === 1 ? 'primary' : 'secondary'}
							onClick={() => setIssuesView('table')}
						>
							<Icon data={view_column} />
						</Button>
					</div>
				</div>
			</div>
			<IssueView />
		</div>
	);
};
