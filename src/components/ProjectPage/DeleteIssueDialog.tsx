import { Button, CircularProgress, Dialog, DialogContent, Icon } from '@equinor/eds-core-react';
import { Issue } from '../../validators';
import { useState } from 'react';
import { delete_to_trash } from '@equinor/eds-icons';
import { useDeleteIssue } from '../../hooks/api/useDeleteIssue';

export const DeleteIssueDialog = ({ issue }: DeleteIssueDialogProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const { mutate: deleteIssue, isPending } = useDeleteIssue();
	return (
		<>
			<Button
				variant='ghost_icon'
				onPointerDown={() => {
					setIsOpen(true);
				}}
			>
				<Icon data={delete_to_trash} />
			</Button>
			{isOpen && (
				<Dialog
					open
					className='fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform'
				>
					<DialogContent>
						<div className='flex flex-col gap-4 text-center'>
							<h2 className='text-2xl font-semibold'>Delete Issue</h2>
							<p className='text-text-tertiary'>
								Are you sure you want to delete the issue &quot;{issue.name}&quot;?
							</p>
							<div className='flex flex-col gap-2'>
								<Button variant='outlined' onClick={() => setIsOpen(prev => !prev)}>
									Cancel
								</Button>
								<Button
									color='danger'
									onClick={() => {
										deleteIssue(issue.id);
									}}
								>
									{isPending ? <CircularProgress size={24} /> : 'Delete'}
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			)}
		</>
	);
};

type DeleteIssueDialogProps = {
	issue: Issue;
};
