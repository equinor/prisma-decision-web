import { Button, Icon, Table } from '@equinor/eds-core-react';
import { delete_to_trash, edit } from '@equinor/eds-icons';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useController } from 'react-hook-form';
import { useIssueForm } from '../../../../hooks/useIssueForm';
import { boundaryTypes, Issue, issueTypes } from '../../../../validators';
import { BoundaryLabel } from '../../../common/Cards/BoundaryLabel';
import { DeleteIssueDialog } from '../../../common/DeleteIssueDialog';
import { DropdownTableCell } from '../../../common/DropdownTableCell';
import { EditableTableCell } from '../../../common/EditableTableCell';
import { EditIssueModal } from '../../../common/EditIssueModal';
import { format } from 'date-fns/format';
import { IssueTypeLabel } from '../../../common/Cards/IssueTypeLabel';

export const IssueRow = ({ issue }: IssueRowProps) => {
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const { control, onSubmit } = useIssueForm({ issue });
	const {
		field: { onChange: onChangeName },
	} = useController({ control, name: 'name' });
	const {
		field: { onChange: onChangeDescription },
	} = useController({ control, name: 'description' });
	const {
		field: { onChange: onChangeType },
	} = useController({ control, name: 'type' });
	const {
		field: { onChange: onChangeBoundary },
	} = useController({ control, name: 'boundary' });

	return (
		<>
			<Table.Row key={issue.id}>
				<Table.Cell className='px-0! pl-1!'>
					<div className='flex items-center'>
						<Button variant='ghost_icon' onClick={() => setEditOpen(true)}>
							<Icon data={edit} />
						</Button>
						<Button variant='ghost_icon' onClick={() => setDeleteOpen(true)}>
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
				<DropdownTableCell
					value={issue.type}
					options={issueTypes}
					onChange={onChangeType}
					onBlur={() => onSubmit()}
					renderValue={type => (
						<div className='flex h-full items-center justify-center'>
							<IssueTypeLabel type={type} />
						</div>
					)}
				/>
				<DropdownTableCell
					value={issue.boundary}
					options={boundaryTypes}
					onChange={onChangeBoundary}
					onBlur={() => onSubmit()}
					renderValue={boundary => (
						<div className='flex h-full items-center justify-center'>
							<BoundaryLabel boundary={boundary} />
						</div>
					)}
				/>
				<Table.Cell className='whitespace-nowrap'>
					{' '}
					{issue.created_at ? format(issue.created_at, 'yyyy-MM-dd') : '-'}
				</Table.Cell>
				<Table.Cell className='whitespace-nowrap'>
					{' '}
					{issue.updated_at ? format(issue.updated_at, 'yyyy-MM-dd') : '-'}
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
};
