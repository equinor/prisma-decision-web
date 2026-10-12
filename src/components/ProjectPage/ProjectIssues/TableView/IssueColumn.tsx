import { cn } from '../../../../utils/cn';
import { getIssueColumnColor } from '../../../../utils/getIssueColumnColor';
import { Issue, IssueType } from '../../../../validators';
import {
	IssueCard,
	IssueCardDeleteMenuItem,
	IssueCardEditMenuItem,
	IssueCardExpandableContent,
	IssueCardExpandTrigger,
	IssueCardMenu,
	IssueCardStates,
} from '../../../common/Cards/IssueCard';
import { DraggableIssueContainer } from '../../../common/DraggableIssueContainer';
import { DroppableIssueContainer } from '../../../common/DroppableIssueContainer';
import { IssueBoardCardHeader } from './IssueBoardCardHeader';
import { ReactNode } from 'react';

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
						<DraggableIssueContainer
							key={issue.id}
							issue={issue}
							index={index}
							type={issueType}
						>
							<IssueCard
								issue={issue}
								className={
									highlightedIssueIds.includes(issue.id)
										? 'ring-primary-resting ring-2'
										: undefined
								}
							>
								{highlightedIssueIds.includes(issue.id) && (
									<span
										role='status'
										aria-label='Issue created'
										className='sr-only'
									>
										Issue created: {issue.name}
									</span>
								)}
								<IssueBoardCardHeader issue={issue}>
									<IssueCardMenu>
										<IssueCardEditMenuItem />
										<IssueCardDeleteMenuItem />
									</IssueCardMenu>
								</IssueBoardCardHeader>
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
