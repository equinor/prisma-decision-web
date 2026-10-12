import { useExpandCard } from '../../../hooks/useExpandCard';
import { cn } from '../../../utils/cn';
import { Issue, IssueType } from '../../../validators';
import { IssueTextField } from '../../ProjectPage/ProjectIssues/IssueTextField';
import { DraggableIssueContainer } from '../DraggableIssueContainer';
import {
	IssueCard,
	IssueCardDeleteMenuItem,
	IssueCardEditMenuItem,
	IssueCardHeader,
	IssueCardMenu,
} from './IssueCard';
import { IssueCardEditableStates } from './IssueCardEditableStates';

export const IssueBoardCard = ({
	issue,
	index,
	type,
}: {
	issue: Issue;
	index: number;
	type: IssueType;
}) => {
	const { expanded } = useExpandCard(issue.id);
	return (
		<DraggableIssueContainer issue={issue} index={index} type={type}>
			<IssueCard issue={issue} className='gap-0'>
				<IssueCardHeader editable>
					<IssueCardMenu>
						<IssueCardEditMenuItem />
						<IssueCardDeleteMenuItem />
					</IssueCardMenu>
				</IssueCardHeader>
				<div className='pb-1'>
					<div className='text-base leading-6 font-bold'>
						<IssueTextField issue={issue} field='name' showHint variant='card' />
					</div>
					<div className='text-text-tertiary text-sm'>
						<IssueTextField
							issue={issue}
							field='description'
							className={cn('line-clamp-1', { 'line-clamp-none': expanded })}
							showHint
							variant='card'
						/>
					</div>
				</div>
				{(issue.type === 'Decision' || issue.type === 'Uncertainty') && (
					<IssueCardEditableStates />
				)}
			</IssueCard>
		</DraggableIssueContainer>
	);
};
