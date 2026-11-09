import { Button, Icon } from '@equinor/eds-core-react/next';
import { view_column, view_list } from '@equinor/eds-icons';
import { useLocalStorage } from '@uidotdev/usehooks';
import '@xyflow/react/dist/style.css';
import { CreateIssueButton } from '../../common/CreateIssueButton';
import { SegmentedSelector } from '../../common/SegmentedSelector';
import { ListView } from './ListView/ListView';
import { TableView } from './TableView/TableView';
import { IssueBoardFocus, issueBoardFocuses } from './TableView/issueBoardFocus';
import { ToggleExpandAll } from '../ToggleExpandAll';
import { useSelectedProject } from '../ProjectContext';

export const ProjectIssues = () => {
	const [issueView, setIssuesView] = useLocalStorage('issuesView', 'list');
	const [boardFocus, setBoardFocus] = useLocalStorage<IssueBoardFocus>(
		'issuesBoardFocus',
		'Overview',
	);
	const selectedProject = useSelectedProject();
	const isBoardView = issueView === 'table';

	return (
		<div className='flex flex-col gap-4'>
			<div className='grid w-full grid-cols-[1fr_auto] items-center justify-between gap-2'>
				<h1 className='truncate text-3xl font-bold'>{selectedProject.name}</h1>
				<div className='flex items-center gap-4'>
					<CreateIssueButton />
					{isBoardView && (
						<>
							<ToggleExpandAll />
							<div className='border-background-medium w-100 max-w-[40vw] rounded-sm border'>
								<SegmentedSelector
									label='Board focus'
									name='issuesBoardFocus'
									value={boardFocus}
									compact
									options={issueBoardFocuses.map(value => ({
										value,
										label: value,
									}))}
									onChange={event =>
										setBoardFocus(event.currentTarget.value as IssueBoardFocus)
									}
								/>
							</div>
						</>
					)}
					<div role='group' aria-label='Issues view' className='flex gap-1'>
						<Button
							icon
							aria-label='List view'
							aria-pressed={!isBoardView}
							variant={!isBoardView ? 'primary' : 'secondary'}
							onClick={() => setIssuesView('list')}
						>
							<Icon data={view_list} />
						</Button>
						<Button
							icon
							aria-label='Board view'
							aria-pressed={isBoardView}
							variant={isBoardView ? 'primary' : 'secondary'}
							onClick={() => setIssuesView('table')}
						>
							<Icon data={view_column} />
						</Button>
					</div>
				</div>
			</div>
			{isBoardView ? <TableView key={boardFocus} focus={boardFocus} /> : <ListView />}
		</div>
	);
};
