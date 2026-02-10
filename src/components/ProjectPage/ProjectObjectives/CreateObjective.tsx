import { Button, Icon, CircularProgress, Popover } from '@equinor/eds-core-react';
import { add, close } from '@equinor/eds-icons';
import { useObjectiveForm } from '../../../hooks/useObjectiveForm';
import { useRef, useState } from 'react';
import { ObjectiveFormFields } from './ObjectiveFormFields';

export const CreateObjective = () => {
	const [isOpen, setIsOpen] = useState(false);
	const referenceElement = useRef<HTMLButtonElement>(null);

	const {
		register,
		handleSubmit,
		formState: { errors },
		isPending,
		control,
	} = useObjectiveForm({
		onSuccess: () => setIsOpen(false),
	});
	return (
		<>
			<Button
				ref={referenceElement}
				variant='outlined'
				onClick={() => setIsOpen(prev => !prev)}
			>
				<Icon data={add} />
				Create Objective
			</Button>
			<Popover
				open={isOpen}
				onClose={() => setIsOpen(false)}
				anchorEl={referenceElement.current}
			>
				<Popover.Content className='relative w-[min(520px,_90vw)]'>
					<form className='grid w-full grid-cols-1 gap-4' onSubmit={handleSubmit}>
						<div className='w-full cursor-pointer pr-16'>
							<h2 className='text-2xl font-semibold'>Create Objective</h2>
							<p className='text-text-tertiary'>
								Add objectives that will help achieve the desired outcome
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
						<ObjectiveFormFields
							register={register}
							errors={errors}
							control={control}
						/>

						<Button
							className='w-max justify-self-end'
							type='submit'
							disabled={isPending}
						>
							{isPending ? <CircularProgress size={16} /> : ' Add Objective'}
						</Button>
					</form>
				</Popover.Content>
			</Popover>
		</>
	);
};
