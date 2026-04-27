import { Button, Icon, Popover, TextField, CircularProgress } from '@equinor/eds-core-react';
import { ErrorMessage } from '@hookform/error-message';
import { useState, useRef } from 'react';
import { useAssessmentForm } from '../../../hooks/useAssessmentForm';
import { FormErrorMessage } from '../../common/FormErrorMessage';
import { add, close } from '@equinor/eds-icons';

export const CreateAssessment = () => {
	const [isOpen, setIsOpen] = useState(false);
	const referenceElement = useRef<HTMLButtonElement>(null);

	const {
		register,
		handleSubmit,
		formState: { errors },
		isPending,
	} = useAssessmentForm({
		onSuccess: () => {
			setIsOpen(false);
		},
	});

	return (
		<>
			<Button
				ref={referenceElement}
				variant='outlined'
				onClick={() => setIsOpen(prev => !prev)}
			>
				<Icon data={add} />
				Create Assessment
			</Button>
			<Popover
				open={isOpen}
				onClose={() => setIsOpen(false)}
				anchorEl={referenceElement.current}
			>
				<Popover.Content className='relative w-[min(520px,90vw)]'>
					<form className='grid w-full grid-cols-1 gap-4' onSubmit={handleSubmit}>
						<div className='w-full pr-16'>
							<h2 className='text-xl font-semibold'>Create Assessment</h2>
							<p className='text-text-tertiary text-sm'>
								Add an assessment to evaluate your project decisions over time.
							</p>
						</div>
						<Button
							variant='ghost_icon'
							className='absolute! top-2 right-2'
							onClick={e => {
								e.stopPropagation();
								setIsOpen(false);
							}}
						>
							<Icon data={close} />
						</Button>
						<div>
							<TextField
								label='Name'
								placeholder='Enter assessment name...'
								{...register('name')}
							/>
							<ErrorMessage as={FormErrorMessage} name='name' errors={errors} />
						</div>
						<div className='flex justify-end'>
							<Button type='submit' disabled={isPending}>
								{isPending ? <CircularProgress size={16} /> : 'Add Assessment'}
							</Button>
						</div>
					</form>
				</Popover.Content>
			</Popover>
		</>
	);
};
