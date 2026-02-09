import { Button, Dialog, DialogContent, Icon } from '@equinor/eds-core-react';
import { useDeleteStrategy } from '../../../hooks/api/useDeleteStategy';
import { Strategy } from '../../../validators';
import { delete_to_trash } from '@equinor/eds-icons';
import { useState } from 'react';

export const DeleteStrategyDialog = ({ strategy }: DeleteStrategyDialogProps) => {
	const [open, setOpen] = useState(false);
	const { mutate: deleteStrategy } = useDeleteStrategy();
	return (
		<>
			<Button onClick={() => setOpen(true)} variant='ghost_icon' color='danger'>
				<Icon data={delete_to_trash} />
			</Button>
			<Dialog
				open={open}
				data-no-dnd
				className='nodrag nopan nowheel fixed top-1/2
					left-1/2 -translate-x-1/2 -translate-y-1/2 transform'
			>
				<DialogContent>
					<div className='flex flex-col gap-4 text-center'>
						<h2 className='text-2xl font-semibold'>Delete Strategy</h2>
						<p className='text-text-tertiary'>
							Are you sure you want to delete the strategy &quot;{strategy.name}
							&quot;?
						</p>
						<div className='flex flex-col gap-2'>
							<Button variant='outlined' onClick={() => setOpen(false)}>
								Cancel
							</Button>
							<Button
								color='danger'
								onClick={() => {
									deleteStrategy(strategy);
								}}
							>
								Delete
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
};

type DeleteStrategyDialogProps = {
	strategy: Strategy;
};
