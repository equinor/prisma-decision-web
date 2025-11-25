import { Button, Chip, Icon, Menu } from '@equinor/eds-core-react';
import { Issue } from '../../../validators';
import { CardContainer } from './CardContainer';
import { DeleteIssueDialog } from '../../ProjectPage/DeleteIssueDialog';
import { EditIssueModal } from '../../ProjectPage/EditIssueModal';
import { useState } from 'react';
import { edit, more_vertical } from '@equinor/eds-icons';

export const FactCard = ({ issue, ...rest }: FactCardProps) => {
	const [menuOpen, setMenuOpen] = useState(false);
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	return (
		<CardContainer {...rest}>
			<div className='flex items-center justify-between'>
				<div className='flex gap-2'>
					<Chip>Fact</Chip>
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
						<Menu.Item onClick={() => setEditOpen(true)}>
							<p>Edit</p>
							<Icon data={edit} />
						</Menu.Item>
						<Menu.Item onClick={() => setDeleteOpen(true)}>Delete</Menu.Item>
					</Menu>
				</div>
			</div>
			<h3 className='font-semibold '>{issue.name}</h3>
			<p className='text-text-tertiary line-clamp-2 text-sm'>{issue.description}</p>
			<EditIssueModal issue={issue} open={editOpen} onClose={() => setEditOpen(false)} />
			<DeleteIssueDialog
				issue={issue}
				open={deleteOpen}
				onClose={() => setDeleteOpen(false)}
			/>
		</CardContainer>
	);
};

type FactCardProps = {
	issue: Issue;
	className?: string;
};
