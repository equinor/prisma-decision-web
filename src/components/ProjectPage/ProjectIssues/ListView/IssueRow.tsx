import { Table } from '@equinor/eds-core-react';
import { Button, Icon } from '@equinor/eds-core-react/next';
import { delete_to_trash, edit } from '@equinor/eds-icons';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useController } from 'react-hook-form';
import { useIssueForm } from '../../../../hooks/useIssueForm';
import { useIssueClassification } from '../../../../hooks/useIssueClassification';
import { Issue } from '../../../../validators';
import { BoundaryLabel } from '../../../common/Cards/BoundaryLabel';
import { DecisionTypeLabel } from '../../../common/Cards/DecisionTypeLabel';
import { IssueTypeLabel } from '../../../common/Cards/IssueTypeLabel';
import { KeyLabel } from '../../../common/Cards/KeyLabel';
import { DeleteIssueDialog } from '../../../common/DeleteIssueDialog';
import { EditableTableCell } from '../../../common/EditableTableCell';
import { EditIssueModal } from '../../../common/EditIssueModal';

export const IssueRow = ({ issue, highlighted }: IssueRowProps) => {
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const { control, onSubmit } = useIssueForm({ issue });
	const { changeType, changeDecisionType, changeBoundary, toggleKey } =
		useIssueClassification(issue);
	const {
		field: { onChange: onChangeName },
	} = useController({ control, name: 'name' });
	const {
		field: { onChange: onChangeDescription },
	} = useController({ control, name: 'description' });

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
				<EditableTableCell
					value={issue.name}
					onChange={onChangeName}
					onBlur={() => onSubmit()}
				/>
				<EditableTableCell
					className='max-w-xl truncate'
					value={issue.description}
					onChange={onChangeDescription}
					onBlur={() => onSubmit()}
				/>
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
