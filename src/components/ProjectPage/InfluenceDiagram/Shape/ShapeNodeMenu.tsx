import { Menu } from '@equinor/eds-core-react';
import { Button, Icon } from '@equinor/eds-core-react/next';
import { delete_to_trash, edit, more_vertical } from '@equinor/eds-icons';
import { useState } from 'react';
import { Issue } from '../../../../validators';
import { useIssueCardContext } from '../../../common/Cards/useIssueCardContext';

export const ShapeNodeMenu = ({ issue }: { issue: Issue }) => {
	const { setEditOpen, setDeleteOpen } = useIssueCardContext();
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
	const [open, setOpen] = useState(false);

	return (
		<>
			<div className='influence-shape-control nodrag nopan nowheel absolute inset-y-0 right-1/2 -left-9 flex items-center pr-2'>
				<Button
					ref={setAnchorEl}
					variant='ghost'
					size='small'
					icon
					aria-label='Issue actions'
					aria-haspopup='menu'
					aria-expanded={open}
					onClick={event => {
						event.stopPropagation();
						setOpen(true);
					}}
					className='size-7! min-h-0! rounded-full! bg-(--eds-color-bg-floating)! p-0! shadow-md'
				>
					<Icon data={more_vertical} size='sm' />
				</Button>
			</div>
			<Menu
				anchorEl={anchorEl}
				open={open}
				onClose={() => setOpen(false)}
				placement='bottom-start'
				aria-label={`Issue actions: ${issue.name}`}
				className='nodrag nopan nowheel'
				onClick={event => event.stopPropagation()}
			>
				<Menu.Item onClick={() => setEditOpen(true)}>
					<Icon data={edit} size='md' />
					<span>Edit</span>
				</Menu.Item>
				<Menu.Item onClick={() => setDeleteOpen(true)}>
					<Icon data={delete_to_trash} size='md' />
					<span>Delete</span>
				</Menu.Item>
			</Menu>
		</>
	);
};
