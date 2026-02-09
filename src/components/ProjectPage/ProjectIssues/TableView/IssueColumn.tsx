import { cn } from '../../../../utils/cn';
import { getIssueCardType } from '../../../../utils/getIssueCardType';
import { getIssueColumnColor } from '../../../../utils/getIssueColumnColor';
import { Issue, IssueType } from '../../../../validators';
import { DraggableIssueContainer } from '../../../common/DraggableIssueContainer';
import { DroppableIssueContainer } from '../../../common/DroppableIssueContainer';

export const IssueColumn = ({ issueType, issues = [], label }: IssueColumnProps) => {
	return (
		<div className='flex min-w-64.25 basis-full flex-col gap-2'>
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
				{issues.map((issue, index) => {
					const Card = getIssueCardType(issue.type);
					return (
						<DraggableIssueContainer
							key={issue.id}
							issue={issue}
							index={index}
							type={issueType}
						>
							<Card issue={issue} />
						</DraggableIssueContainer>
					);
				})}
			</DroppableIssueContainer>
		</div>
	);
};

type IssueColumnProps = {
	issueType: Exclude<IssueType, 'Utility'>;
	issues: Issue[];
	label: string;
};
