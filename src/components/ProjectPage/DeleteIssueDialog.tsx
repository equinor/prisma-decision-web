import { Button, Dialog, DialogContent, Icon } from '@equinor/eds-core-react';
import { delete_to_trash } from '@equinor/eds-icons';
import { useState } from 'react';
import { useDeleteIssueOptimistic } from '../../hooks/api/useDeleteIssue';
import { Issue } from '../../validators';

export const DeleteIssueDialog = ({ issue }: DeleteIssueDialogProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const { mutate: deleteIssue } = useDeleteIssueOptimistic();
	return (
		<>
			<Button
				data-no-dnd
				variant='ghost_icon'
				onClick={() => {
					setIsOpen(true);
				}}
				className='nodrag'
			>
				<Icon data={delete_to_trash} />
			</Button>
			{isOpen && (
				<Dialog
					open
					data-no-dnd
					className='nodrag nopan nowheel fixed top-1/2
					left-1/2 -translate-x-1/2 -translate-y-1/2 transform'
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
									Delete
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
