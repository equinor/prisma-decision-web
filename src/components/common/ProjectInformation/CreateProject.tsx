import { Button, CircularProgress, Icon, Popover, TextField } from '@equinor/eds-core-react';
import { add, close } from '@equinor/eds-icons';
import { useRef, useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { useProjectForm } from '../../../hooks/useProjectForm';
import { ErrorMessage } from '@hookform/error-message';
import { FormErrorMessage } from '../FormErrorMessage';
export const CreateProject = () => {
	const [isOpen, setIsOpen] = useState(false);
	const { formMethods, isPending, handleSubmit } = useProjectForm();
	const {
		register,
		formState: { errors },
	} = formMethods;

	const referenceElement = useRef<HTMLButtonElement>(null);

	return (
		<>
			<Button
				ref={referenceElement}
				variant='outlined'
				onClick={() => setIsOpen(prev => !prev)}
			>
				<Icon data={add} />
				Create Project
			</Button>
			<Popover
				open={isOpen}
				onClose={() => setIsOpen(false)}
				anchorEl={referenceElement.current}
			>
				<Popover.Content className='relative w-[min(543px,90vw)]'>
					<FormProvider {...formMethods}>
						<form
							onSubmit={handleSubmit}
							className='flex flex-col items-start gap-4 rounded-sm'
						>
							<div className='w-full'>
								<TextField
									label='Project Name'
									placeholder='Enter project name...'
									{...register('name')}
									onBlur={() => {
										handleSubmit();
									}}
								/>
								<ErrorMessage as={FormErrorMessage} name='name' errors={errors} />
							</div>

							<Button
								variant='ghost_icon'
								className='absolute! top-0.5 right-2'
								onClick={e => {
									e.stopPropagation();
									setIsOpen(false);
								}}
							>
								<Icon data={close} />
							</Button>

							<Button className='md:self-end' type='submit' disabled={isPending}>
								{isPending ? <CircularProgress size={16} /> : 'Create Project'}
							</Button>
						</form>
					</FormProvider>
				</Popover.Content>
			</Popover>
		</>
	);
};
