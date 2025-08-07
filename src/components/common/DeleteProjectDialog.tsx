import { Button, Dialog, DialogContent, Icon } from '@equinor/eds-core-react';
import { delete_to_trash } from '@equinor/eds-icons';
import { useState } from 'react';
import { useDeleteProjectOptimistic } from '../../hooks/api/useDeleteProject';
import { Project } from '../../validators';

export const DeleteProjectDialog = ({ project }: DeleteProjectDialogProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const { mutate: deleteProject } = useDeleteProjectOptimistic();
	return (
		<>
			<Button
				variant='ghost_icon'
				onClick={e => {
					e.stopPropagation();
					e.preventDefault();
					setIsOpen(true);
				}}
			>
				<Icon data={delete_to_trash} />
			</Button>
			{isOpen && (
				<Dialog
					onClick={e => {
						e.stopPropagation();
						e.preventDefault();
					}}
					open
					className='nodrag fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform'
				>
					<DialogContent>
						<div className='flex flex-col gap-4 text-center'>
							<h2 className='text-2xl font-semibold'>Delete Issue</h2>
							<p className='text-text-tertiary'>
								Are you sure you want to delete the issue &quot;{project.name}
								&quot;?
							</p>
							<div className='flex flex-col gap-2'>
								<Button variant='outlined' onClick={() => setIsOpen(prev => !prev)}>
									Cancel
								</Button>
								<Button
									color='danger'
									onClick={() => {
										deleteProject(project.id);
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

type DeleteProjectDialogProps = {
	project: Project;
};
