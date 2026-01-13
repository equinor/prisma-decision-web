import { Button, Dialog, DialogContent, Icon } from '@equinor/eds-core-react';
import { copy } from '@equinor/eds-icons';
import { useState } from 'react';
import { Project } from '../../validators';
import { useDuplicateProject } from '../../hooks/api/useDuplicateProject';

export const DuplicateProjectDialog = ({ project }: DuplicateProjectDialogProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const { mutate: duplicateProject } = useDuplicateProject();
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
				<Icon data={copy} />
			</Button>

			<Dialog
				open={isOpen}
				onClick={e => {
					e.stopPropagation();
					e.preventDefault();
				}}
				className='nodrag fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform'
			>
				<DialogContent>
					<div className='flex flex-col gap-4 text-center'>
						<h2 className='text-2xl font-semibold'>Duplicate Project</h2>
						<p className='text-text-tertiary'>
							You are going to duplicate &quot;{project.name}
							&quot;?
						</p>
						<div className='flex flex-col gap-2'>
							<Button
								color='primary'
								onClick={() => {
									duplicateProject(project.id);
									setIsOpen(false);
								}}
							>
								Duplicate
							</Button>
							<Button variant='outlined' onClick={() => setIsOpen(prev => !prev)}>
								Cancel
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
};

type DuplicateProjectDialogProps = {
	project: Project;
};
