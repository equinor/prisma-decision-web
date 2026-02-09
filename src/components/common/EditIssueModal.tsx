import { Button, CircularProgress, Dialog, DialogContent, Icon } from '@equinor/eds-core-react';
import { close } from '@equinor/eds-icons';
import { FormProvider, useWatch } from 'react-hook-form';
import { useIssueForm } from '../../hooks/useIssueForm';
import { Issue } from '../../validators';
import { DecisionFormSection } from '../ProjectPage/ProjectIssues/IssueFormSections/DecisionFormSection';
import { IssueFormSection } from '../ProjectPage/ProjectIssues/IssueFormSections/IssueFormSection';
import { UncertaintyFormSection } from '../ProjectPage/ProjectIssues/IssueFormSections/UncertaintyFormSection';

export const EditIssueModal = ({ issue, onClose, open = false }: EditIssueModalProps) => {
	const formMethods = useIssueForm({
		issue,
		onSuccess: () => onClose(false),
	});
	const { control, onSubmit, isPending, reset } = formMethods;
	const selectedType = useWatch({
		control,
		name: 'type',
	});

	const handleClose = () => {
		onClose(false);
		reset();
	};
	return (
		<Dialog
			data-no-dnd
			open={open}
			className='nodrag nopan nowheel fixed top-1/2 left-1/2 max-h-[90vh]
			w-[min(700px,90vw)]! -translate-x-1/2 -translate-y-1/2 transform overflow-auto'
		>
			<DialogContent>
				<FormProvider {...formMethods}>
					<form onSubmit={onSubmit} className='flex flex-col gap-4'>
						<div className='flex items-center justify-between'>
							<h2 className='text-2xl font-semibold'>Edit Issue</h2>
							<Button variant='ghost_icon' onClick={handleClose}>
								<Icon data={close} />
							</Button>
						</div>

						<IssueFormSection />
						{selectedType === 'Decision' && <DecisionFormSection />}
						{selectedType === 'Uncertainty' && <UncertaintyFormSection />}
						<div className='flex justify-end gap-2'>
							<Button variant='outlined' onClick={handleClose}>
								Cancel
							</Button>
							<Button type='submit' disabled={isPending}>
								{isPending ? <CircularProgress size={16} /> : 'Update Issue'}
							</Button>
						</div>
					</form>
				</FormProvider>
			</DialogContent>
		</Dialog>
	);
};

type EditIssueModalProps = {
	issue: Issue;
	open?: boolean;
	onClose: (value: boolean) => void;
};
