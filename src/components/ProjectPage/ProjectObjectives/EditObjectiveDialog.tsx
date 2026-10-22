import { Button, Dialog, CircularProgress, DialogContent, Icon } from '@equinor/eds-core-react';
import { ReactNode, useState } from 'react';
import { Objective } from '../../../validators';
import { useObjectiveForm } from '../../../hooks/useObjectiveForm';
import { useObjectiveLinkSelection } from '../../../hooks/useObjectiveLinkSelection';
import { close, edit } from '@equinor/eds-icons';
import { ObjectiveFormFields } from './ObjectiveFormFields';
import { ObjectiveLinkFields } from './ObjectiveLinkFields';

export const EditObjectiveDialog = ({ objective, trigger }: EditObjectiveProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const linkSelection = useObjectiveLinkSelection(objective.id);
	const formMethods = useObjectiveForm({
		objective,
		onSuccess: () => setIsOpen(false),
		onValidSubmit: linkSelection.save,
	});
	const {
		register,
		handleSubmit,
		isPending,
		formState: { errors },
		control,
	} = formMethods;
	const open = () => {
		linkSelection.reset();
		setIsOpen(true);
	};

	return (
		<>
			{trigger ? (
				trigger(open)
			) : (
				<Button variant='ghost_icon' onClick={open}>
					<Icon data={edit} />
				</Button>
			)}
			{isOpen && (
				<Dialog
					data-no-dnd
					open
					className='fixed top-1/2 left-1/2 max-h-[90vh]
					 w-[min(700px,90vw)]! -translate-x-1/2 -translate-y-1/2 transform overflow-auto'
				>
					<DialogContent>
						<form className='grid w-full grid-cols-1 gap-4' onSubmit={handleSubmit}>
							<div className='w-full pr-16'>
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
							<ObjectiveLinkFields
								control={control}
								selection={linkSelection.selection}
								onChange={linkSelection.setSelection}
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
	trigger?: (open: () => void) => ReactNode;
};
