import { Button, Dialog, DialogContent, Icon } from '@equinor/eds-core-react';
import { delete_to_trash } from '@equinor/eds-icons';
import { useState } from 'react';
import { useDeleteProject } from '../../hooks/api/useDeleteProject';
import { Project } from '../../validators';

export const DeleteProjectDialog = ({ project, showLabel }: DeleteProjectDialogProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const { mutate: deleteProject } = useDeleteProject();
	return (
		<>
			<Button
				variant={showLabel ? 'outlined' : 'ghost_icon'}
				color={showLabel ? 'danger' : undefined}
				onClick={e => {
					e.stopPropagation();
					e.preventDefault();
					setIsOpen(true);
				}}
			>
				<Icon data={delete_to_trash} />
				{showLabel && 'Delete'}
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
						<div className='flex flex-col gap-4'>
							<h2 className='text-center text-2xl font-semibold'>Delete Project</h2>
							<p className='text-text-tertiary text-center wrap-break-word'>
								Are you sure you want to delete the Project &quot;{project.name}
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
										setIsOpen(false);
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
	showLabel?: boolean;
};
