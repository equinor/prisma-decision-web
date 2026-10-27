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

export const IssueColumn = ({ column, accept, issues = [] }: IssueColumnProps) => {
	return (
		<div className='flex min-w-64.25 basis-full flex-col gap-2'>
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
								<IssueCardHeader>
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
			</DroppableIssueContainer>
		</div>
	);
};

type IssueColumnProps = {
	column: BoardColumn;
	accept: string[];
	issues: Issue[];
};
