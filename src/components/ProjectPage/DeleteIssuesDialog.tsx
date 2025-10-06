import { Button, Dialog, DialogContent, Icon } from '@equinor/eds-core-react';
import { delete_to_trash } from '@equinor/eds-icons';
import { useState } from 'react';
import { useDeleteIssueOptimistic } from '../../hooks/api/useDeleteIssue';
import { Issue } from '../../validators';

export const DeleteIssuesDialog = ({ issue }: DeleteIssueDialogProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const { mutate: deleteIssue } = useDeleteIssueOptimistic();

	const handleDelete = () => {
		issue.forEach(iss => deleteIssue(iss.id));
		setIsOpen(false);
	};
	const noSelectedIssues = issue.length === 0;
	return (
		<>
			<Button
				disabled={noSelectedIssues}
				data-no-dnd
				className='px-1.5!'
				variant='outlined'
				onClick={() => {
					setIsOpen(true);
				}}
			>
				<Icon data={delete_to_trash} />
			</Button>
			{isOpen && (
				<Dialog
					open
					data-no-dnd
					className='nodrag nowheel fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform'
				>
					<DialogContent>
						<div className='flex flex-col gap-4 text-center'>
							<h2 className='text-2xl font-semibold'>Delete Issues</h2>
							<p className='text-text-tertiary'>
								You are about to delete {issue.length} issues. Are you sure you want
								to delete the selected issues?
							</p>
							<div className='flex flex-col gap-2'>
								<Button variant='outlined' onClick={() => setIsOpen(prev => !prev)}>
									Cancel
								</Button>
								<Button color='danger' onClick={handleDelete}>
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
	issue: Issue[];
};
