import { Button, Chip, Icon, Menu } from '@equinor/eds-core-react';
import { Issue } from '../../../validators';

import { CardContainer } from './CardContainer';
import { DeleteIssueDialog } from '../../ProjectPage/DeleteIssueDialog';
import { EditIssueModal } from '../../ProjectPage/EditIssueModal';
import { more_vertical } from '@equinor/eds-icons';
import { useState } from 'react';

export const UnassignedCard = ({ issue, ...rest }: UnassignedCardProps) => {
	const [menuOpen, setMenuOpen] = useState(false);
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	return (
		<CardContainer {...rest}>
			<div className='flex items-center justify-between'>
				<div className='flex gap-2'>
					<Chip>Unassigned</Chip>
					<Chip className='capitalize'>{issue.boundary}</Chip>
				</div>
				<div>
					<Button
						ref={setAnchorEl}
						onClick={() => setMenuOpen(true)}
						variant='ghost_icon'
					>
						<Icon data={more_vertical} />
					</Button>
					<Menu open={menuOpen} onClose={() => setMenuOpen(false)} anchorEl={anchorEl}>
						<Menu.Item onClick={() => setEditOpen(true)}>Edit</Menu.Item>
						<Menu.Item onClick={() => setDeleteOpen(true)}>Delete</Menu.Item>
					</Menu>
				</div>
			</div>
			<h3 className='font-semibold '>{issue.name}</h3>
			<p className='text-text-tertiary overflow-hidden text-sm'>{issue.description}</p>
			<EditIssueModal issue={issue} open={editOpen} onClose={() => setEditOpen(false)} />
			<DeleteIssueDialog
				issue={issue}
				open={deleteOpen}
				onClose={() => setDeleteOpen(false)}
			/>
		</CardContainer>
	);
};

type UnassignedCardProps = {
	issue: Issue;
	className?: string;
};
