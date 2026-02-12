import { Button, Dialog, CircularProgress, DialogContent, Icon } from '@equinor/eds-core-react';
import { useState } from 'react';
import { Objective } from '../../../validators';
import { useObjectiveForm } from '../../../hooks/useObjectiveForm';
import { close, edit } from '@equinor/eds-icons';
import { ObjectiveFormFields } from './ObjectiveFormFields';

export const EditObjectiveDialog = ({ objective }: EditObjectiveProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const formMethods = useObjectiveForm({
		objective,
		onSuccess: () => setIsOpen(false),
	});
	const {
		register,
		handleSubmit,
		isPending,
		formState: { errors },
		control,
	} = formMethods;

	return (
		<>
			<Button variant='ghost_icon' onClick={() => setIsOpen(true)}>
				<Icon data={edit} />
			</Button>
			{isOpen && (
				<Dialog
					data-no-dnd
					open
					className='fixed top-1/2 left-1/2 max-h-[90vh]
					 w-[min(700px,_90vw)]! -translate-x-1/2 -translate-y-1/2 transform overflow-auto'
				>
					<DialogContent>
						<form className='grid w-full grid-cols-1 gap-4' onSubmit={handleSubmit}>
							<div className='w-full cursor-pointer pr-16'>
								<h2 className='text-2xl font-semibold'>Edit Objective</h2>
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
								{isPending ? <CircularProgress size={16} /> : ' Update Objective'}
							</Button>
						</form>
					</DialogContent>
				</Dialog>
			)}
		</>
	);
};

type EditObjectiveProps = {
	objective: Objective;
};
