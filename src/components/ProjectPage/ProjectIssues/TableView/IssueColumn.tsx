import { Dispatch, SetStateAction } from 'react';
import { cn } from '../../../../utils/cn';
import { Issue } from '../../../../validators';
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
import { DraggableIssueContainer } from '../../../common/DraggableIssueContainer';
import { DroppableIssueContainer } from '../../../common/DroppableIssueContainer';
import { BoardColumn } from './boardColumns';
import { BoardDraftLocation, IssueDraftControl } from './IssueDraftControl';

export const IssueColumn = ({
	column,
	accept,
	issues = [],
	activeDraft,
	setActiveDraft,
}: IssueColumnProps) => {
	// Quick-create only exists for columns that map to an issue type
	const issueType = column.issueType;
	return (
		<section
			aria-label={`${column.label} issues`}
			className='flex min-w-79 basis-full flex-col gap-2'
		>
			<div className='flex items-center justify-between'>
				<h3 className='font-medium'>{column.label}</h3>
				<span className='bg-background-light w-8 rounded-full text-center text-sm'>
					{issues.length}
				</span>
			</div>
			<DroppableIssueContainer
				columnId={column.id}
				accept={accept}
				className={cn('flex h-full flex-col gap-2 rounded-sm p-2', column.className)}
			>
				{issueType && (
					<IssueDraftControl
						issueType={issueType}
						position='top'
						activeDraft={activeDraft}
						setActiveDraft={setActiveDraft}
					/>
				)}
				{issues.map((issue, index) => {
					return (
						<DraggableIssueContainer
							key={issue.id}
							issue={issue}
							index={index}
							columnId={column.id}
							accept={accept}
						>
							<IssueCard issue={issue}>
								<IssueCardHeader editable>
									<IssueCardMenu>
										<IssueCardEditMenuItem />
										<IssueCardDeleteMenuItem />
									</IssueCardMenu>
								</IssueCardHeader>
								<IssueCardExpandableContent />
								{issue.type !== 'Fact' && (
									<IssueCardStates>
										<IssueCardExpandTrigger />
									</IssueCardStates>
								)}
							</IssueCard>
						</DraggableIssueContainer>
					);
				})}
				{issueType && (
					<IssueDraftControl
						issueType={issueType}
						position='bottom'
						activeDraft={activeDraft}
						setActiveDraft={setActiveDraft}
					/>
				)}
			</DroppableIssueContainer>
		</section>
	);
};

type IssueColumnProps = {
	column: BoardColumn;
	accept: string[];
	issues: Issue[];
	activeDraft: BoardDraftLocation | null;
	setActiveDraft: Dispatch<SetStateAction<BoardDraftLocation | null>>;
};
