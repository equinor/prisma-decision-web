import {
	Button,
	CircularProgress,
	Dialog,
	DialogContent,
	Icon,
	TextField,
} from '@equinor/eds-core-react';
import { add, close } from '@equinor/eds-icons';
import { ErrorMessage } from '@hookform/error-message';
import { useState } from 'react';
import { useStakeholderMatrixForm } from '../../../hooks/useStakeholderMatrixForm';
import { FormErrorMessage } from '../../common/FormErrorMessage';

export const CreateStakeholderMatrix = () => {
	const [isOpen, setIsOpen] = useState(false);
	const {
		register,
		handleSubmit,
		formState: { errors },
		isPending,
	} = useStakeholderMatrixForm({ onSuccess: () => setIsOpen(false) });

	return (
		<>
			<Button variant='outlined' onClick={() => setIsOpen(true)}>
				<Icon data={add} />
				Create stakeholder
			</Button>
			{isOpen && (
				<Dialog
					open
					className='fixed top-1/2 left-1/2 max-h-[90vh] w-[min(560px,90vw)]! -translate-x-1/2 -translate-y-1/2 overflow-auto'
				>
					<DialogContent>
						<form className='grid gap-4' onSubmit={handleSubmit}>
							<div className='pr-12'>
								<h2 className='text-2xl font-semibold'>Create stakeholder</h2>
								<p className='text-text-tertiary text-sm'>
									Place a stakeholder according to their influence and impact.
								</p>
							</div>
							<Button
								variant='ghost_icon'
								className='absolute! top-2 right-2'
								aria-label='Close'
								onClick={() => setIsOpen(false)}
							>
								<Icon data={close} />
							</Button>
							<div>
								<TextField
									label='Name'
									placeholder='Enter stakeholder name...'
									{...register('stakeholder_name')}
								/>
								<ErrorMessage
									as={FormErrorMessage}
									name='stakeholder_name'
									errors={errors}
								/>
							</div>
							<div>
								<TextField
									label='Role'
									placeholder='Enter role or organization...'
									{...register('stakeholder_role')}
								/>
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
								{isPending ? <CircularProgress size={16} /> : 'Add stakeholder'}
							</Button>
						</form>
					</DialogContent>
				</Dialog>
			)}
		</>
	);
};
