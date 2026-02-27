import { Button, CircularProgress, Icon, Popover } from '@equinor/eds-core-react';
import { add, close } from '@equinor/eds-icons';
import { useRef, useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { useProjectForm } from '../../../hooks/useProjectForm';
import { ProjectNameField } from './ProjectNameField';
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
				placement='bottom-end'
			>
				<Popover.Content className='relative w-[min(543px,90vw)]'>
					<FormProvider {...formMethods}>
						<form onSubmit={handleSubmit} className='grid w-full grid-cols-1 gap-4'>
							<div className='w-full pr-16'>
								<h2 className='text-2xl font-semibold'>Create Project</h2>
								<p className='text-text-tertiary'>
									Create a new project to start oprimizing
								</p>
							</div>
							<ProjectNameField register={register} errors={errors} />
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

							<Button
								className='w-max justify-self-end'
								type='submit'
								disabled={isPending}
							>
								{isPending ? <CircularProgress size={16} /> : 'Create Project'}
							</Button>
						</form>
					</FormProvider>
				</Popover.Content>
			</Popover>
		</>
	);
};
