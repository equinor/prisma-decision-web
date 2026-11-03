import { KeyboardSensor, PointerSensor } from '@dnd-kit/dom';
import { RestrictToElement } from '@dnd-kit/dom/modifiers';
import { DragDropProvider, DragOverlay } from '@dnd-kit/react';
import { useState } from 'react';
import { useIssueDragAndDrop } from '../../../../hooks/useIssueDragAndDrop';
import { canDndStartFrom } from '../../../../utils/canDndStartFrom';
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
import { BoardDraftLocation } from './IssueDraftControl';

const sensors = [
	PointerSensor.configure({
		preventActivation: (event, source) => {
			if (!canDndStartFrom(event.target)) return true;
			if (event.target instanceof Element && event.target.closest('[data-card-action]'))
				return false;
			return PointerSensor.defaults.preventActivation?.(event, source) ?? false;
		},
	}),
	KeyboardSensor,
];

export const TableView = ({ grouping = 'overview' }: { grouping?: BoardGrouping }) => {
	const [activeDraft, setActiveDraft] = useState<BoardDraftLocation | null>(null);
	const columns = boardColumns[grouping];
	const accept = columns.map(column => column.id);
	const { issues, onDragEnd, onDragOver, onBeforeDragStart } = useIssueDragAndDrop(columns);
	return (
		<DragDropProvider
			sensors={sensors}
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
								activeDraft={activeDraft}
								setActiveDraft={setActiveDraft}
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
