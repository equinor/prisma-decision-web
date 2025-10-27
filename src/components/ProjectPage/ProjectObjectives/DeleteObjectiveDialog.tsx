import { Button, Dialog, DialogContent, Icon } from '@equinor/eds-core-react';
import { delete_to_trash } from '@equinor/eds-icons';
import { useState } from 'react';
import { useDeleteObjective } from '../../../hooks/api/useDeleteObjective';
import { Objective } from '../../../validators';

export const DeleteObjectiveDialog = ({ objective }: DeleteObjectiveProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const { mutate: deleteObjective } = useDeleteObjective();
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
					className='nodrag fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform'
				>
					<DialogContent>
						<div className='flex flex-col gap-4 text-center'>
							<h2 className='text-2xl font-semibold'>Delete Opportunity</h2>
							<p className='text-text-tertiary'>
								Are you sure you want to delete the opportunity &quot;
								{objective.name}&quot;?
							</p>
							<div className='flex flex-col gap-2'>
								<Button variant='outlined' onClick={() => setIsOpen(prev => !prev)}>
									Cancel
								</Button>
								<Button
									color='danger'
									onClick={() => {
										deleteObjective(objective);
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

type DeleteObjectiveProps = {
	objective: Objective;
};
