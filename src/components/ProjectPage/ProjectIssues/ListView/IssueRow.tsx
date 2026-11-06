import { Table } from '@equinor/eds-core-react';
import { Button, Icon } from '@equinor/eds-core-react/next';
import { delete_to_trash, edit } from '@equinor/eds-icons';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Issue } from '../../../../validators';
import { useIssueClassification } from '../../../../hooks/useIssueClassification';
import { BoundaryLabel } from '../../../common/Cards/BoundaryLabel';
import { DecisionTypeLabel } from '../../../common/Cards/DecisionTypeLabel';
import { IssueTypeLabel } from '../../../common/Cards/IssueTypeLabel';
import { KeyLabel } from '../../../common/Cards/KeyLabel';
import { DeleteIssueDialog } from '../../../common/DeleteIssueDialog';
import { EditIssueModal } from '../../../common/EditIssueModal';
import { IssueTextField } from '../IssueTextField';

export const IssueRow = ({ issue, highlighted }: IssueRowProps) => {
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const { changeType, changeDecisionType, changeBoundary, toggleKey } =
		useIssueClassification(issue);

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
							icon
							aria-label={`Edit issue: ${issue.name}`}
							onClick={() => setEditOpen(true)}
						>
							<Icon data={edit} size='md' />
						</Button>
						<Button
							variant='ghost'
							icon
							aria-label={`Delete issue: ${issue.name}`}
							onClick={() => setDeleteOpen(true)}
						>
							<Icon data={delete_to_trash} size='md' />
						</Button>
					</div>
				</Table.Cell>
				<Table.Cell className='p-0!'>
					<IssueTextField issue={issue} field='name' />
				</Table.Cell>
				<Table.Cell className='max-w-xl p-0!'>
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
					<IssueTypeLabel type={issue.type} onChange={changeType} />
				</Table.Cell>
				<Table.Cell>
					{issue.type === 'Decision' && (
						<DecisionTypeLabel
							type={issue.decision.type}
							onChange={changeDecisionType}
						/>
					)}
					{issue.type === 'Uncertainty' && (
						<KeyLabel isKey={issue.uncertainty.is_key} onChange={toggleKey} />
					)}
				</Table.Cell>
				<Table.Cell>
					<BoundaryLabel boundary={issue.boundary} onChange={changeBoundary} />
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
