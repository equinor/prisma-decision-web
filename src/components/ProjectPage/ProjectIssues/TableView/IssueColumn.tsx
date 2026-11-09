import { Dispatch, SetStateAction } from 'react';
import { cn } from '../../../../utils/cn';
import { getIssueColumnColor } from '../../../../utils/getIssueColumnColor';
import { DecisionType, Issue } from '../../../../validators';
import { DroppableIssueContainer } from '../../../common/DroppableIssueContainer';
import { IssueBoardCard } from '../../../common/Cards/IssueBoardCard';
import { BoardDraftLocation, IssueDraftControl } from './IssueDraftControl';

export const IssueColumn = ({
	issueType,
	issues = [],
	label,
	columnId = issueType,
	decisionType,
	isKey,
	colorClassName = getIssueColumnColor(issueType),
	acceptedColumnIds,
	activeDraft,
	setActiveDraft,
}: IssueColumnProps) => {
	const columnClassName = cn('flex h-full flex-col gap-2 rounded-sm p-2', colorClassName);

	return (
		<section aria-label={`${label} issues`} className='flex min-w-90 basis-full flex-col gap-2'>
			<div className='flex items-center justify-between'>
				<h3 className='font-medium'>{label}</h3>
				<span className='bg-background-light w-8 rounded-full text-center text-sm'>
					{issues.length}
				</span>
			</div>
			<DroppableIssueContainer
				issueType={issueType}
				id={columnId}
				acceptedTypes={acceptedColumnIds}
				className={columnClassName}
			>
				<IssueDraftControl
					issueType={issueType}
					columnId={columnId}
					decisionType={decisionType}
					isKey={isKey}
					position='top'
					activeDraft={activeDraft}
					setActiveDraft={setActiveDraft}
				/>
				{issues.map((issue, index) => (
					<IssueBoardCard
						key={issue.id}
						issue={issue}
						index={index}
						type={issueType}
						group={columnId}
						acceptedGroups={acceptedColumnIds}
					/>
				))}
				{issues.length > 0 && (
					<IssueDraftControl
						issueType={issueType}
						columnId={columnId}
						decisionType={decisionType}
						isKey={isKey}
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
	issueType: BoardDraftLocation['type'];
	issues: Issue[];
	label: string;
	columnId?: string;
	decisionType?: DecisionType;
	isKey?: boolean;
	colorClassName?: string;
	acceptedColumnIds?: readonly string[];
	activeDraft: BoardDraftLocation | null;
	setActiveDraft: Dispatch<SetStateAction<BoardDraftLocation | null>>;
};
