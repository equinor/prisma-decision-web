import { useCallback, useState } from 'react';
import { useExpandCard } from '../../../../hooks/useExpandCard';
import { cn } from '../../../../utils/cn';
import { Issue, IssueType } from '../../../../validators';
import {
	IssueCard,
	IssueCardDeleteMenuItem,
	IssueCardEditMenuItem,
	IssueCardExpandTrigger,
	IssueCardMenu,
	IssueCardStates,
} from '../../../common/Cards/IssueCard';
import { DraggableIssueContainer } from '../../../common/DraggableIssueContainer';
import { IssueTextField } from '../IssueTextField';
import { IssueBoardCardHeader } from './IssueBoardCardHeader';
import { IssueBoardEditingContext, useIssueBoardEditing } from './IssueBoardEditingContext';
import { IssueBoardStates } from './IssueBoardStates';

export const IssueBoardCard = ({
	issue,
	index,
	type,
	highlighted = false,
}: {
	issue: Issue;
	index: number;
	type: IssueType;
	highlighted?: boolean;
}) => {
	const { expanded } = useExpandCard(issue.id);
	const [activeEditors, setActiveEditors] = useState<Set<string>>(new Set());
	const setEditing = useCallback((editorId: string, active: boolean) => {
		setActiveEditors(previous => {
			if (previous.has(editorId) === active) return previous;
			const next = new Set(previous);
			if (active) next.add(editorId);
			else next.delete(editorId);
			return next;
		});
	}, []);
	const onStateEditingChange = useCallback(
		(issueId: string, active: boolean) => setEditing(`states:${issueId}`, active),
		[setEditing],
	);
	const editing = activeEditors.size > 0;
	return (
		<IssueBoardEditingContext value={{ editing, setEditing }}>
			<DraggableIssueContainer issue={issue} index={index} type={type} disabled={editing}>
				<IssueCard
					issue={issue}
					className={cn('gap-0', {
						'ring-primary-resting ring-2': highlighted,
					})}
				>
					{highlighted && (
						<span role='status' aria-label='Issue created' className='sr-only'>
							Issue created: {issue.name}
						</span>
					)}
					<IssueBoardCardHeader issue={issue}>
						<IssueCardMenu compact>
							<IssueCardEditMenuItem />
							<IssueCardDeleteMenuItem />
						</IssueCardMenu>
					</IssueBoardCardHeader>
					<div className='pb-1'>
						<div className='font-bold'>
							<IssueBoardTextField issue={issue} field='name' />
						</div>
						<div className='text-text-tertiary text-sm'>
							<IssueBoardTextField
								issue={issue}
								field='description'
								className={cn('line-clamp-1', { 'line-clamp-none': expanded })}
							/>
						</div>
					</div>
					{issue.type === 'Decision' || issue.type === 'Uncertainty' ? (
						<IssueBoardStates issue={issue} onEditingChange={onStateEditingChange} />
					) : (
						issue.type !== 'Fact' && (
							<IssueCardStates>
								<IssueCardExpandTrigger />
							</IssueCardStates>
						)
					)}
				</IssueCard>
			</DraggableIssueContainer>
		</IssueBoardEditingContext>
	);
};

const IssueBoardTextField = ({
	issue,
	field,
	className,
}: {
	issue: Issue;
	field: 'name' | 'description';
	className?: string;
}) => {
	const { setEditing } = useIssueBoardEditing();
	const onEditingChange = useCallback(
		(active: boolean) => setEditing(field, active),
		[field, setEditing],
	);
	return (
		<IssueTextField
			issue={issue}
			field={field}
			className={className}
			showHint
			onEditingChange={onEditingChange}
		/>
	);
};
