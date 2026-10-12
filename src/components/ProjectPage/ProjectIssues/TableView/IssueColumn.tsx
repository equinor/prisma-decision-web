import { Dispatch, SetStateAction } from 'react';
import { cn } from '../../../../utils/cn';
import { getIssueColumnColor } from '../../../../utils/getIssueColumnColor';
import { Issue } from '../../../../validators';
import { DroppableIssueContainer } from '../../../common/DroppableIssueContainer';
import { IssueBoardCard } from '../../../common/Cards/IssueBoardCard';
import { BoardDraftLocation, IssueDraftControl } from './IssueDraftControl';

export const IssueColumn = ({
	issueType,
	issues = [],
	label,
	activeDraft,
	setActiveDraft,
}: IssueColumnProps) => {
	return (
		<section aria-label={`${label} issues`} className='flex min-w-79 basis-full flex-col gap-2'>
			<div className='flex items-center justify-between'>
				<h3 className='font-medium'>{label}</h3>
				<span className='bg-background-light w-8 rounded-full text-center text-sm'>
					{issues.length}
				</span>
			</div>
			<DroppableIssueContainer
				issueType={issueType}
				className={cn(
					'flex h-full flex-col gap-2 rounded-sm p-2',
					getIssueColumnColor(issueType),
				)}
			>
				<IssueDraftControl
					issueType={issueType}
					position='top'
					activeDraft={activeDraft}
					setActiveDraft={setActiveDraft}
				/>
				{issues.map((issue, index) => {
					return (
						<IssueBoardCard
							key={issue.id}
							issue={issue}
							index={index}
							type={issueType}
						/>
					);
				})}
				<IssueDraftControl
					issueType={issueType}
					position='bottom'
					activeDraft={activeDraft}
					setActiveDraft={setActiveDraft}
				/>
			</DroppableIssueContainer>
		</section>
	);
};

type IssueColumnProps = {
	issueType: BoardDraftLocation['type'];
	issues: Issue[];
	label: string;
	activeDraft: BoardDraftLocation | null;
	setActiveDraft: Dispatch<SetStateAction<BoardDraftLocation | null>>;
};
