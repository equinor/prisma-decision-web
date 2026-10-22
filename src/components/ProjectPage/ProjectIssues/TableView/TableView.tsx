import { RestrictToElement } from '@dnd-kit/dom/modifiers';
import { DragDropProvider, DragOverlay } from '@dnd-kit/react';
import { useIssueDragAndDrop } from '../../../../hooks/useIssueDragAndDrop';
import {
	IssueCard,
	IssueCardDeleteMenuItem,
	IssueCardEditMenuItem,
	IssueCardExpandableContent,
	IssueCardExpandTrigger,
	IssueCardHeader,
	IssueCardMenu,
	IssueCardStates,
} from '../../../common/Cards/IssueCard';
import { BoardGrouping, boardColumns } from './boardColumns';
import { IssueColumn } from './IssueColumn';

export const TableView = ({ grouping }: { grouping: BoardGrouping }) => {
	const columns = boardColumns[grouping];
	const accept = columns.map(column => column.id);
	const { issues, onDragEnd, onDragOver, onBeforeDragStart } = useIssueDragAndDrop(columns);
	return (
		<DragDropProvider
			onBeforeDragStart={onBeforeDragStart}
			onDragOver={onDragOver}
			onDragEnd={onDragEnd}
			modifiers={[RestrictToElement]}
		>
			<div className='bg-background-default shadow-tile rounded-sm p-4'>
				<div className=' h-[calc(100vh-285px)] w-full overflow-auto'>
					<div className='flex min-h-full flex-1 items-stretch gap-4'>
						{columns.map(column => (
							<IssueColumn
								key={column.id}
								column={column}
								accept={accept}
								issues={issues[column.id]}
							/>
						))}
					</div>
				</div>
			</div>
			<DragOverlay>
				{source => {
					return (
						<IssueCard issue={source.data.issue}>
							<IssueCardHeader>
								<IssueCardMenu>
									<IssueCardEditMenuItem />
									<IssueCardDeleteMenuItem />
								</IssueCardMenu>
							</IssueCardHeader>
							<IssueCardExpandableContent />
							<IssueCardStates>
								<IssueCardExpandTrigger />
							</IssueCardStates>
						</IssueCard>
					);
				}}
			</DragOverlay>
		</DragDropProvider>
	);
};
