import { KeyboardSensor, PointerSensor } from '@dnd-kit/dom';
import { RestrictToElement } from '@dnd-kit/dom/modifiers';
import { DragDropProvider, DragOverlay } from '@dnd-kit/react';
import { useState } from 'react';
import { useIssueDragAndDrop } from '../../../../hooks/useIssueDragAndDrop';
import { canDndStartFrom } from '../../../../utils/canDndStartFrom';
import { decisionTypes, issueTypes } from '../../../../validators';
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
import { BoardDraftLocation } from './IssueDraftControl';
import { IssueBoardFocus } from './issueBoardFocus';

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

export const TableView = ({ focus = 'Overview' }: { focus?: IssueBoardFocus }) => {
	const [activeDraft, setActiveDraft] = useState<BoardDraftLocation | null>(null);
	const { issues, onDragEnd, onDragOver, onBeforeDragStart } = useIssueDragAndDrop(focus);
	const groupedColumns =
		focus === 'Decisions'
			? decisionTypes.map(type => ({
					label: type,
					issueType: 'Decision' as const,
					decisionType: type,
					isKey: undefined,
					colorClassName: type === 'Focus' ? 'bg-yellow-300/25' : 'bg-gray-300/25',
					issues: issues[type],
				}))
			: [
					{
						label: 'Key',
						issueType: 'Uncertainty' as const,
						decisionType: undefined,
						isKey: true,
						colorClassName: 'bg-green-300/25',
						issues: issues.Key,
					},
					{
						label: 'Not key',
						issueType: 'Uncertainty' as const,
						decisionType: undefined,
						isKey: false,
						colorClassName: 'bg-gray-300/25',
						issues: issues['Not key'],
					},
				];
	const acceptedColumnIds =
		focus === 'Overview'
			? issueTypes.filter(type => type !== 'Utility')
			: groupedColumns.map(column => column.label);
	return (
		<DragDropProvider
			sensors={sensors}
			onBeforeDragStart={onBeforeDragStart}
			onDragOver={onDragOver}
			onDragEnd={onDragEnd}
			modifiers={[RestrictToElement]}
		>
			<div className='bg-background-default shadow-tile rounded-sm p-4'>
				<div className='h-[calc(100vh-208px)] w-full overflow-auto'>
					<div className='flex min-h-full flex-1 items-stretch gap-2'>
						{focus === 'Overview'
							? issueTypes
									.filter(type => type !== 'Utility')
									.map(issueType => (
										<IssueColumn
											key={issueType}
											issues={issues[issueType]}
											issueType={issueType}
											label={issueType}
											acceptedColumnIds={acceptedColumnIds}
											activeDraft={activeDraft}
											setActiveDraft={setActiveDraft}
										/>
									))
							: groupedColumns.map(column => (
									<IssueColumn
										key={column.label}
										columnId={column.label}
										label={column.label}
										issueType={column.issueType}
										decisionType={column.decisionType}
										isKey={column.isKey}
										colorClassName={column.colorClassName}
										issues={column.issues}
										acceptedColumnIds={acceptedColumnIds}
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
