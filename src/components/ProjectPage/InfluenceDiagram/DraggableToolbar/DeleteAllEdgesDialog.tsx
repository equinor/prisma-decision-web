import { Button, Dialog, DialogContent } from '@equinor/eds-core-react';
import { useDeleteEdges } from '../../../../hooks/api/useDeleteEdges';
import { useSelectedProjectEdges } from '../../../../hooks/useSelectedProjectEdges';

export const DeleteAllEdgesDialog = ({ open, onClose }: DeleteAllEdgesDialogProps) => {
	const { edges, isFetching } = useSelectedProjectEdges();
	const { mutate: deleteEdges, isPending } = useDeleteEdges();

	return (
		<Dialog
			open={open}
			data-no-dnd
			className='nodrag nopan nowheel pointer-events-auto fixed top-1/2
				left-1/2 -translate-x-1/2 -translate-y-1/2 transform cursor-auto'
		>
			<DialogContent>
				<div className='flex flex-col gap-4 text-center'>
					<h2 className='text-2xl font-semibold'>Delete All Edges</h2>
					<p className='text-text-tertiary'>
						Are you sure you want to delete all {edges.length} edges in this project?
					</p>
					<div className='flex flex-col gap-2'>
						<Button variant='outlined' onClick={onClose}>
							Cancel
						</Button>
						<Button
							color='danger'
							disabled={isFetching || isPending}
							onClick={() =>
								deleteEdges(
									edges.map(edge => edge.id),
									{ onSuccess: onClose },
								)
							}
						>
							Delete all edges
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

type DeleteAllEdgesDialogProps = {
	open: boolean;
	onClose: () => void;
};
