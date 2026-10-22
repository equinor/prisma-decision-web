import { Menu } from '@equinor/eds-core-react';
import { Icon } from '@equinor/eds-core-react/next';
import { delete_to_trash } from '@equinor/eds-icons';
import { useState } from 'react';
import { useSelectedProjectEdges } from '../../../hooks/useSelectedProjectEdges';
import { ReactFlowInfluenceNode } from '../../../types';
import { DeleteIssuesDialog } from '../DeleteIssuesDialog';
import { DeleteAllEdgesDialog } from './DeleteAllEdgesDialog';
import { ToolbarButton } from './Toolbar';

export const DeleteMenu = ({ selectedNodes }: DeleteMenuProps) => {
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
	const [isOpen, setIsOpen] = useState(false);
	const [dialog, setDialog] = useState<'issues' | 'edges' | null>(null);
	const { edges, isFetching } = useSelectedProjectEdges();

	const openDialog = (nextDialog: 'issues' | 'edges') => {
		setIsOpen(false);
		setDialog(nextDialog);
	};

	return (
		<>
			<ToolbarButton
				ref={setAnchorEl}
				data-no-dnd
				icon
				tone='accent'
				tooltip='Delete'
				active={isOpen}
				aria-haspopup='menu'
				aria-expanded={isOpen}
				onClick={() => setIsOpen(prev => !prev)}
			>
				<Icon data={delete_to_trash} />
			</ToolbarButton>
			<Menu open={isOpen} anchorEl={anchorEl} onClose={() => setIsOpen(false)}>
				<Menu.Item
					disabled={selectedNodes.length === 0}
					onClick={() => openDialog('issues')}
				>
					Delete selected issues
				</Menu.Item>
				<Menu.Item
					disabled={isFetching || edges.length === 0}
					onClick={() => openDialog('edges')}
				>
					Delete all edges
				</Menu.Item>
			</Menu>
			<DeleteIssuesDialog
				nodes={selectedNodes}
				open={dialog === 'issues'}
				onClose={() => setDialog(null)}
			/>
			<DeleteAllEdgesDialog open={dialog === 'edges'} onClose={() => setDialog(null)} />
		</>
	);
};

type DeleteMenuProps = {
	selectedNodes: ReactFlowInfluenceNode[];
};
