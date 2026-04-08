import { Button, Dialog, DialogContent } from '@equinor/eds-core-react';
import { useDeleteIssue } from '../../hooks/api/useDeleteIssue';
import { Issue } from '../../validators';

export const DeleteIssueDialog = ({ issue, open = false, onClose }: DeleteIssueDialogProps) => {
	const { mutate: deleteIssue } = useDeleteIssue();
	return (
		<Dialog
			open={open}
			data-no-dnd
			className='nodrag nopan nowheel pointer-events-auto fixed top-1/2
			left-1/2 -translate-x-1/2 -translate-y-1/2 transform cursor-auto'


>
			<DialogContent>
				<div className='flex flex-col gap-4 text-center'>
					<h2 className='text-2xl font-semibold'>Delete Issue</h2>
					<p className='text-text-tertiary'>
						Are you sure you want to delete the issue &quot;{issue.name}&quot;?
					</p>
					<div className='flex flex-col gap-2'>
						<Button variant='outlined' onClick={() => onClose(false)}>
							Cancel
						</Button>
						<Button
							color='danger'
							onClick={() => {
								deleteIssue(issue.id);
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

type DeleteIssueDialogProps = {
	issue: Issue;
	open?: boolean;
	onClose: (value: boolean) => void;
};
