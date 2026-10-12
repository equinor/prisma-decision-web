import { CircularProgress } from '@equinor/eds-core-react';
import { Button, Dialog } from '@equinor/eds-core-react/next';
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
			onOpenChange={value => {
				if (!value) handleClose();
			}}
			className='nodrag nopan nowheel pointer-events-auto max-h-[90vh]
			w-[min(700px,90vw)]! cursor-auto overflow-auto'
		>
			<FormProvider {...formMethods}>
				<form onSubmit={onSubmit} className='flex flex-col gap-4'>
					<Dialog.Header>
						<Dialog.Title>Edit Issue</Dialog.Title>
					</Dialog.Header>
					<Dialog.Content>
						<fieldset disabled={isPending} className='flex w-full flex-col gap-4'>
							<IssueFormSection />
							{selectedType === 'Decision' && <DecisionFormSection />}
							{selectedType === 'Uncertainty' && <UncertaintyFormSection />}
						</fieldset>
					</Dialog.Content>
					<Dialog.Actions>
						<Button type='button' variant='secondary' onClick={handleClose}>
							Cancel
						</Button>
						<Button
							type='submit'
							disabled={isPending}
							aria-label='Update Issue'
							aria-busy={isPending}
						>
							{isPending ? <CircularProgress size={16} /> : 'Update Issue'}
						</Button>
					</Dialog.Actions>
				</form>
			</FormProvider>
		</Dialog>
	);
};

type EditIssueModalProps = {
	issue: Issue;
	open?: boolean;
	onClose: (value: boolean) => void;
};
