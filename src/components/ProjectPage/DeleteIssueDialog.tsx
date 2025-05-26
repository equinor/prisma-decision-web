import { Button, Dialog, DialogContent } from '@equinor/eds-core-react';
import { Issue } from './ProjectPage';

export const DeleteIssueDialog = ({
	issue,
	onDeleteIssue,
	open = false,
	onClose,
}: DeleteIssueDialogProps) => {
	return (
		<Dialog
			open={open}
			className='fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform'
		>
			<DialogContent>
				<div className='flex flex-col gap-4 text-center'>
					<h2 className='text-2xl font-semibold'>Delete Issue</h2>
					<p className='text-text-tertiary'>
						Are you sure you want to delete the issue &quot;{issue.name}&quot;?
					</p>
					<div className='flex flex-col gap-2'>
						<Button variant='outlined' onClick={onClose}>
							Cancel
						</Button>
						<Button
							color='danger'
							onClick={() => {
								onDeleteIssue(issue);
								onClose();
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
	open: boolean;
	onDeleteIssue: (issue: Issue) => void;
	onClose: () => void;
};
