import { Button, Dialog, DialogContent, Icon, Tooltip } from '@equinor/eds-core-react';
import { delete_to_trash } from '@equinor/eds-icons';
import { useState } from 'react';
import { useDeleteStakeholderMatrix } from '../../../hooks/api/useDeleteStakeholderMatrix';
import type { StakeholderMatrix } from '../../../validators';

export const DeleteStakeholderMatrixDialog = ({
	stakeholder,
}: DeleteStakeholderMatrixDialogProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const { mutate: deleteStakeholder, isPending } = useDeleteStakeholderMatrix();

	return (
		<>
			<Tooltip title='Delete stakeholder'>
				<Button
					variant='ghost_icon'
					color='danger'
					aria-label='Delete stakeholder'
					onClick={() => setIsOpen(true)}
				>
					<Icon data={delete_to_trash} />
				</Button>
			</Tooltip>
			{isOpen && (
				<Dialog
					open
					className='fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform'
				>
					<DialogContent>
						<div className='flex flex-col gap-4 text-center'>
							<h2 className='text-2xl font-semibold'>Delete stakeholder</h2>
							<p className='text-text-tertiary'>
								Are you sure you want to delete &quot;{stakeholder.stakeholder_name}
								&quot;?
							</p>
							<div className='flex flex-col gap-2'>
								<Button
									variant='outlined'
									disabled={isPending}
									onClick={() => setIsOpen(false)}
								>
									Cancel
								</Button>
								<Button
									color='danger'
									disabled={isPending}
									onClick={() =>
										deleteStakeholder(stakeholder, {
											onSuccess: () => setIsOpen(false),
										})
									}
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

type DeleteStakeholderMatrixDialogProps = {
	stakeholder: StakeholderMatrix;
};
