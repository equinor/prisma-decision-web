import { cn } from '../../../../utils/cn';
import { getIssueColumnColor } from '../../../../utils/getIssueColumnColor';
import { Issue, IssueType } from '../../../../validators';
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
					return (
						<DraggableIssueContainer
							key={issue.id}
							issue={issue}
							index={index}
							type={issueType}
						>
							<IssueCard issue={issue}>
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
