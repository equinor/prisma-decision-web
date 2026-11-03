import { Button, Icon } from '@equinor/eds-core-react/next';
import { layers, view_column, view_list } from '@equinor/eds-icons';
import { useLocalStorage } from '@uidotdev/usehooks';
import '@xyflow/react/dist/style.css';
import { CreateIssues } from '../../common/CreateIssue';
import { SegmentedControl } from '../../common/SegmentedControl';
import { DecisionTypeView } from './DecisionTypeView/DecisionTypeView';
import { ListView } from './ListView/ListView';
import { BoardGrouping, boardGroupings } from './TableView/boardColumns';
import { TableView } from './TableView/TableView';
import { ToggleExpandAll } from '../ToggleExpandAll';
import { useSelectedProject } from '../ProjectContext';

export const ProjectIssues = () => {
	const [issueView, setIssuesView] = useLocalStorage('issuesView', 'list');
	const [boardGrouping, setBoardGrouping] = useLocalStorage<BoardGrouping>(
		'issuesBoardGrouping',
		'overview',
	);
	const selectedProject = useSelectedProject();
	let issueViewElement = <ListView />;
	let activeView = 0;
	if (issueView === 'table') {
		issueViewElement = <TableView grouping={boardGrouping} />;
		activeView = 1;
	} else if (issueView === 'decisionType') {
		issueViewElement = <DecisionTypeView />;
		activeView = 2;
	}

	return (
		<div className='flex flex-col gap-4'>
			<div className='flex items-center justify-between'>
				<h1 className='text-[32px] leading-10 font-bold'>{selectedProject.name}</h1>
				<div className='flex items-center gap-4'>
					<CreateIssues />
					{activeView === 1 && (
						<>
							<ToggleExpandAll />
							<SegmentedControl
								label='Board focus'
								options={boardGroupings}
								value={boardGrouping}
								onChange={setBoardGrouping}
							/>
						</>
					)}
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
						<Button
							icon
							aria-label='Decision type view'
							aria-pressed={activeView === 2}
							variant={activeView === 2 ? 'primary' : 'secondary'}
							onClick={() => setIssuesView('decisionType')}
						>
							<Icon data={layers} />
						</Button>
					</div>
				</div>
			</div>
			{issueViewElement}
		</div>
	);
};
