import { Button, Icon } from '@equinor/eds-core-react';
import { view_column, view_list } from '@equinor/eds-icons';
import { useLocalStorage } from '@uidotdev/usehooks';
import '@xyflow/react/dist/style.css';
import { CreateIssues } from '../CreateIssue';
import { ListView } from './ListView/ListView';
import { TableView } from './TableView/TableView';
import { ToggleExpandAll } from '../ToggleExpandAll';

export const ProjectIssues = () => {
	const [issueView, setIssuesView] = useLocalStorage('issuesView', 'list');
	let IssueView = ListView;
	let activeView = 0;
	if (issueView === 'table') {
		IssueView = TableView;
		activeView = 1;
	}

	return (
		<div className='flex min-h-screen flex-col'>
			<div className='flex-grow'>
				<div className='flex flex-col gap-4'>
					<div className='flex w-full items-center justify-between'>
						<div className='flex items-center gap-4'>
							<CreateIssues />
							{activeView !== 0 && <ToggleExpandAll />}
							<Button.Toggle selectedIndexes={[activeView]}>
								<Button onClick={() => setIssuesView('list')}>
									<Icon data={view_list} />
								</Button>
								<Button onClick={() => setIssuesView('table')}>
									<Icon data={view_column} />
								</Button>
							</Button.Toggle>
						</div>
					</div>
					<IssueView />
				</div>
			</div>
		</div>
	);
};
