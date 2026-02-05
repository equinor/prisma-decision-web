import { Button, Icon, Table } from '@equinor/eds-core-react';
import { delete_to_trash, edit } from '@equinor/eds-icons';
import { useState } from 'react';
import { getIssueLabel } from '../../../../utils/getIssueLabel';
import { Issue } from '../../../../validators';
import { BoundaryLabel } from '../../../common/Cards/BoundaryLabel';
import { DeleteIssueDialog } from '../../../common/DeleteIssueDialog';
import { EditIssueModal } from '../../../common/EditIssueModal';
import { format } from 'date-fns/format';

export const IssueRow = ({ issue }: IssueRowProps) => {
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const IssueLabel = getIssueLabel(issue.type);
	return (
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
			<Table.Cell>{issue.name}</Table.Cell>
			<Table.Cell className='max-w-xl truncate'>{issue.description}</Table.Cell>
			<Table.Cell className='text-right!'>
				{issue.type === 'Decision'
					? issue.decision.options.length
					: issue.type === 'Uncertainty'
						? issue.uncertainty.outcomes.length
						: null}
			</Table.Cell>
			<Table.Cell>
				<div className='flex items-center justify-center'>
					<IssueLabel />
				</div>
			</Table.Cell>
			<Table.Cell className='capitalize'>
				<div className='flex items-center justify-center'>
					<BoundaryLabel boundary={issue.boundary} />
				</div>
			</Table.Cell>
			<Table.Cell className='whitespace-nowrap'>
				{' '}
				{issue.created_at ? format(issue.created_at, 'yyyy-MM-dd') : '-'}
			</Table.Cell>
			<Table.Cell className='whitespace-nowrap'>
				{' '}
				{issue.updated_at ? format(issue.updated_at, 'yyyy-MM-dd') : '-'}
			</Table.Cell>
			<EditIssueModal issue={issue} onClose={setEditOpen} open={editOpen} />
			<DeleteIssueDialog issue={issue} onClose={setDeleteOpen} open={deleteOpen} />
		</Table.Row>
	);
};

type IssueRowProps = {
	issue: Issue;
};
