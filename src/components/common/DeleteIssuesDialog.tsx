import { Button, Dialog, DialogContent } from '@equinor/eds-core-react';
import { useDeleteIssue } from '../../hooks/api/useDeleteIssue';
import { ReactFlowInfluenceNode } from '../../types';

export const DeleteIssuesDialog = ({ nodes, open, onClose }: DeleteIssueDialogProps) => {
	const { mutate: deleteIssue } = useDeleteIssue();

	const handleDelete = () => {
		nodes.forEach(node => deleteIssue(node.data.issue_id));
		onClose();
	};
	return (
		<Dialog
			open={open}
			data-no-dnd
			className='nodrag nopan nowheel fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform'
		>
			<DialogContent>
				<div className='flex flex-col gap-4 text-center'>
					<h2 className='text-2xl font-semibold'>Delete Issues</h2>
					<p className='text-text-tertiary'>
						You are about to delete {nodes.length} issues. Are you sure you want to
						delete the selected issues?
					</p>
					<div className='flex flex-col gap-2'>
						<Button variant='outlined' onClick={onClose}>
							Cancel
						</Button>
						<Button color='danger' onClick={handleDelete}>
							Delete
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

type DeleteIssueDialogProps = {
	nodes: ReactFlowInfluenceNode[];
	open: boolean;
	onClose: () => void;
};
