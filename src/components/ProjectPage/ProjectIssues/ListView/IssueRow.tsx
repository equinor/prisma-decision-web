import { Table } from '@equinor/eds-core-react';
import { Button, Icon } from '@equinor/eds-core-react/next';
import { delete_to_trash, edit } from '@equinor/eds-icons';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Issue } from '../../../../validators';
import { DeleteIssueDialog } from '../../../common/DeleteIssueDialog';
import { EditIssueModal } from '../../../common/EditIssueModal';
import {
	BoundaryControl,
	DecisionTypeControl,
	IssueTypeControl,
	KeyControl,
} from '../ClassificationControls';
import { useIssueClassification } from '../useIssueClassification';
import { IssueTextField } from '../IssueTextField';

export const IssueRow = ({ issue, highlighted }: IssueRowProps) => {
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const {
		changeType,
		changeDecisionType,
		changeBoundary,
		toggleKey,
		pending: classificationPending,
	} = useIssueClassification(issue);
	const pending = classificationPending;

	return (
		<>
			<Table.Row
				key={issue.id}
				className={highlighted ? '[&>td]:bg-primary-selected-highlight!' : undefined}
			>
				<Table.Cell className='px-0! pl-1!'>
					<div className='flex items-center'>
						<Button
							variant='ghost'
							size='small'
							icon
							aria-label={`Edit issue: ${issue.name}`}
							onClick={() => setEditOpen(true)}
						>
							<Icon data={edit} />
						</Button>
						<Button
							variant='ghost'
							size='small'
							icon
							aria-label={`Delete issue: ${issue.name}`}
							onClick={() => setDeleteOpen(true)}
						>
							<Icon data={delete_to_trash} />
						</Button>
					</div>
				</Table.Cell>
				<Table.Cell>
					<IssueTextField issue={issue} field='name' />
				</Table.Cell>
				<Table.Cell className='max-w-xl'>
					<IssueTextField issue={issue} field='description' className='truncate' />
				</Table.Cell>
				<Table.Cell className='text-right!'>
					{issue.type === 'Decision'
						? issue.decision.options.length
						: issue.type === 'Uncertainty'
							? issue.uncertainty.outcomes.length
							: null}
				</Table.Cell>
				<Table.Cell>
					<IssueTypeControl issue={issue} onChange={changeType} disabled={pending} />
				</Table.Cell>
				<Table.Cell>
					<DecisionTypeControl
						issue={issue}
						onChange={changeDecisionType}
						disabled={pending}
					/>
					<KeyControl issue={issue} onClick={toggleKey} disabled={pending} />
				</Table.Cell>
				<Table.Cell>
					<BoundaryControl issue={issue} onChange={changeBoundary} disabled={pending} />
				</Table.Cell>
			</Table.Row>
			{createPortal(
				<>
					<EditIssueModal issue={issue} onClose={setEditOpen} open={editOpen} />
					<DeleteIssueDialog issue={issue} onClose={setDeleteOpen} open={deleteOpen} />
				</>,
				document.body,
			)}
		</>
	);
};

type IssueRowProps = {
	issue: Issue;
	highlighted?: boolean;
};
