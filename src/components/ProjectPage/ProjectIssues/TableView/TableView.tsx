import { RestrictToElement } from '@dnd-kit/dom/modifiers';
import { DragDropProvider, DragOverlay } from '@dnd-kit/react';
import { useIssueDragAndDrop } from '../../../../hooks/useIssueDragAndDrop';
import { issueTypes } from '../../../../validators';
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
import { IssueColumn } from './IssueColumn';

export const TableView = () => {
	const { issues, onDragEnd, onDragOver, onBeforeDragStart } = useIssueDragAndDrop();
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
						{issueTypes
							.filter(type => type !== 'Utility')
							.map(issueType => (
								<IssueColumn
									key={issueType}
									issues={issues[issueType]}
									issueType={issueType}
									label={issueType}
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
