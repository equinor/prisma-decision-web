import { Button, Dialog, DialogContent } from '@equinor/eds-core-react';
import { useDeleteEdge } from '../../hooks/api/useDeleteEdge';
import { Issue } from '../../validators';

export const DeleteEdgeDialog = ({
	edgeId,
	sourceIssue,
	targetIssue,
	open = false,
	onClose,
}: DeleteEdgeDialogProps) => {
	const { mutate: deleteEdge } = useDeleteEdge();
	return (
		<Dialog
			open={open}
			data-no-dnd
			className='nodrag nopan nowheel pointer-events-auto fixed top-1/2
			left-1/2 -translate-x-1/2 -translate-y-1/2 transform cursor-auto'
		>
			<DialogContent>
				<div className='flex flex-col gap-4 text-center'>
					<h2 className='text-2xl font-semibold'>Delete Edge</h2>
					<p className='text-text-tertiary'>
						Are you sure you want to delete the edge from &quot;{sourceIssue.name}&quot;
						to &quot;{targetIssue.name}&quot;?
					</p>
					<div className='flex flex-col gap-2'>
						<Button variant='outlined' onClick={() => onClose(false)}>
							Cancel
						</Button>
						<Button
							color='danger'
							onClick={() => {
								deleteEdge(edgeId);
							}}
						>
							Delete
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

type DeleteEdgeDialogProps = {
	edgeId: string;
	sourceIssue: Issue;
	targetIssue: Issue;
	open?: boolean;
	onClose: (value: boolean) => void;
};
