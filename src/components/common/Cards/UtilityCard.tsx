import { Button, Icon, Menu } from '@equinor/eds-core-react';
import { delete_to_trash, edit, more_vertical } from '@equinor/eds-icons';
import { useState } from 'react';
import { Issue } from '../../../validators';
import { DeleteIssueDialog } from '../DeleteIssueDialog';
import { EditIssueModal } from '../EditIssueModal';
import { BoundaryLabel } from './BoundaryLabel';
import { CardContainer } from './CardContainer';
import { UtilityLabel } from './IssueLabel';
import { utilityIcon } from '../../../icons';

export const UtilityCard = ({
	issue,
	hasTwoOrMoreParents,
	onClickOpenUtilityTable,
	...rest
}: UtilityCardProps) => {
	const [menuOpen, setMenuOpen] = useState(false);
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	return (
		<CardContainer {...rest} onDoubleClick={() => setEditOpen(true)}>
			<div className='flex items-center justify-between'>
				<div className='flex gap-2'>
					<UtilityLabel />
					<BoundaryLabel boundary={issue.boundary} />
				</div>
				<div>
					<Button
						ref={setAnchorEl}
						onClick={() => setMenuOpen(true)}
						variant='ghost_icon'
						className='nodrag nopan pointer-events-auto'
					>
						<Icon data={more_vertical} />
					</Button>
					<Menu open={menuOpen} onClose={() => setMenuOpen(false)} anchorEl={anchorEl}>
						<Menu.Item onClick={() => setEditOpen(true)}>
							<Icon data={edit} />
							<p>Edit</p>
						</Menu.Item>
						<Menu.Item onClick={() => setDeleteOpen(true)}>
							<Icon data={delete_to_trash} />
							<p>Delete</p>
						</Menu.Item>
						{onClickOpenUtilityTable && (
							<Menu.Item
								onClick={onClickOpenUtilityTable}
								disabled={!hasTwoOrMoreParents}
							>
								<Icon data={utilityIcon} className='ml-1' />
								<p>Utility Table</p>
							</Menu.Item>
						)}
					</Menu>
				</div>
			</div>
			<div>
				<h3 className='font-semibold '>{issue.name}</h3>
				{!hasTwoOrMoreParents && (
					<p className='max-w-[220px] text-xs font-medium text-[#EA580C]'>
						Connect 2+ parent nodes to enable utility table and solver
					</p>
				)}
			</div>
			<EditIssueModal issue={issue} open={editOpen} onClose={() => setEditOpen(false)} />
			<DeleteIssueDialog
				issue={issue}
				open={deleteOpen}
				onClose={() => setDeleteOpen(false)}
			/>
		</CardContainer>
	);
};

type UtilityCardProps = {
	issue: Issue;
	className?: string;
	hasTwoOrMoreParents?: boolean;
	onClickOpenUtilityTable?: () => void;
};
