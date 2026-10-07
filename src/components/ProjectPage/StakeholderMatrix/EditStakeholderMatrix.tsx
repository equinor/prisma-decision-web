import {
	Button,
	CircularProgress,
	Dialog,
	DialogContent,
	Icon,
	TextField,
	Tooltip,
} from '@equinor/eds-core-react';
import { close, edit } from '@equinor/eds-icons';
import { ErrorMessage } from '@hookform/error-message';
import { useState } from 'react';
import { useStakeholderMatrixForm } from '../../../hooks/useStakeholderMatrixForm';
import type { StakeholderMatrix } from '../../../validators';
import { FormErrorMessage } from '../../common/FormErrorMessage';

export const EditStakeholderMatrix = ({ stakeholder }: EditStakeholderMatrixProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const {
		register,
		handleSubmit,
		formState: { errors },
		isPending,
	} = useStakeholderMatrixForm({
		stakeholder,
		onSuccess: () => setIsOpen(false),
	});

	return (
		<>
			<Tooltip title='Edit stakeholder'>
				<Button
					variant='ghost_icon'
					aria-label='Edit stakeholder'
					onClick={() => setIsOpen(true)}
				>
					<Icon data={edit} />
				</Button>
			</Tooltip>
			{isOpen && (
				<Dialog
					open
					className='fixed top-1/2 left-1/2 max-h-[90vh] w-[min(560px,90vw)]! -translate-x-1/2 -translate-y-1/2 overflow-auto'
				>
					<DialogContent>
						<form className='grid gap-4' onSubmit={handleSubmit}>
							<div className='pr-12'>
								<h2 className='text-2xl font-semibold'>Edit stakeholder</h2>
								<p className='text-text-tertiary text-sm'>
									Update details or reposition this stakeholder.
								</p>
							</div>
							<Button
								type='button'
								variant='ghost_icon'
								className='absolute! top-2 right-2'
								aria-label='Close'
								onClick={() => setIsOpen(false)}
							>
								<Icon data={close} />
							</Button>
							<div>
								<TextField label='Name' {...register('stakeholder_name')} />
								<ErrorMessage
									as={FormErrorMessage}
									name='stakeholder_name'
									errors={errors}
								/>
							</div>
							<div>
								<TextField label='Role' {...register('stakeholder_role')} />
								<ErrorMessage
									as={FormErrorMessage}
									name='stakeholder_role'
									errors={errors}
								/>
							</div>

							<Button
								className='w-max justify-self-end'
								type='submit'
								disabled={isPending}
							>
								{isPending ? <CircularProgress size={16} /> : 'Save'}
							</Button>
						</form>
					</DialogContent>
				</Dialog>
			)}
		</>
	);
};

type EditStakeholderMatrixProps = {
	stakeholder: StakeholderMatrix;
};
