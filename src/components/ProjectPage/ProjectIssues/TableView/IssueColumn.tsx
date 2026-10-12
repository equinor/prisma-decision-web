import { cn } from '../../../../utils/cn';
import { getIssueColumnColor } from '../../../../utils/getIssueColumnColor';
import { Issue, IssueType } from '../../../../validators';
import { DroppableIssueContainer } from '../../../common/DroppableIssueContainer';
import { ReactNode } from 'react';
import { IssueBoardCard } from './IssueBoardCard';

export const IssueColumn = ({
	issueType,
	issues = [],
	label,
	quickAdd,
	highlightedIssueIds = [],
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
				{quickAdd?.('top')}
				{issues.map((issue, index) => {
					return (
						<IssueBoardCard
							key={issue.id}
							issue={issue}
							index={index}
							type={issueType}
							highlighted={highlightedIssueIds.includes(issue.id)}
						/>
					);
				})}
				{quickAdd?.('bottom')}
			</DroppableIssueContainer>
		</section>
	);
};

type IssueColumnProps = {
	issueType: Exclude<IssueType, 'Utility'>;
	issues: Issue[];
	label: string;
	quickAdd?: (position: 'top' | 'bottom') => ReactNode;
	highlightedIssueIds?: readonly string[];
};
