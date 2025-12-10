import { Button, Icon, Table } from '@equinor/eds-core-react';
import { delete_to_trash, edit } from '@equinor/eds-icons';
import { useState } from 'react';
import { getIssueColumnColor } from '../../../../utils/getIssueColumnColor';
import { Issue } from '../../../../validators';
import { DeleteIssueDialog } from '../../DeleteIssueDialog';
import { EditIssueModal } from '../../EditIssueModal';

export const IssueRow = ({ issue }: IssueRowProps) => {
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
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
			<Table.Cell>
				{issue.type === 'Decision'
					? issue.decision.options.length
					: issue.type === 'Uncertainty'
						? issue.uncertainty.outcomes.length
						: null}
			</Table.Cell>
			<Table.Cell className={getIssueColumnColor(issue.type)}>{issue.type}</Table.Cell>
			<Table.Cell className='capitalize'>{issue.boundary}</Table.Cell>
			<Table.Cell className='whitespace-nowrap'>2023-05-01</Table.Cell>
			<EditIssueModal issue={issue} onClose={setEditOpen} open={editOpen} />
			<DeleteIssueDialog issue={issue} onClose={setDeleteOpen} open={deleteOpen} />
		</Table.Row>
	);
};

type IssueRowProps = {
	issue: Issue;
};
