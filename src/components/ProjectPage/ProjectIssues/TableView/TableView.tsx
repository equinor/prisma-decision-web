import { RestrictToElement } from '@dnd-kit/dom/modifiers';
import { DragDropProvider, DragOverlay } from '@dnd-kit/react';
import { useIssueDragAndDrop } from '../../../../hooks/useIssueDragAndDrop';
import { getIssueCardType } from '../../../../utils/getIssueCardType';
import { IssueType, issueTypes } from '../../../../validators';
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
			<div className='bg-background-default shadow-tile h-[calc(100vh-285px)] w-full rounded-sm p-4'>
				<div className='flex h-full w-full gap-4 overflow-auto'>
					{issueTypes.map(issueType => (
						<IssueColumn
							key={issueType}
							issues={issues[issueType]}
							issueType={issueType}
							label={issueType}
						/>
					))}
				</div>
			</div>
			<DragOverlay>
				{source => {
					const Card = getIssueCardType(source.type as IssueType);
					return <Card issue={source.data.issue} />;
				}}
			</DragOverlay>
		</DragDropProvider>
	);
};
