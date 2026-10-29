import { CircularProgress } from '@equinor/eds-core-react';
import { Button, Dialog } from '@equinor/eds-core-react/next';
import { useId } from 'react';
import { FormProvider, useWatch } from 'react-hook-form';
import { useIssueForm } from '../../hooks/useIssueForm';
import { Issue } from '../../validators';
import { DecisionFormSection } from '../ProjectPage/ProjectIssues/IssueFormSections/DecisionFormSection';
import { IssueFormSection } from '../ProjectPage/ProjectIssues/IssueFormSections/IssueFormSection';
import { UncertaintyFormSection } from '../ProjectPage/ProjectIssues/IssueFormSections/UncertaintyFormSection';

export const EditIssueModal = ({ issue, onClose, open = false }: EditIssueModalProps) => {
	const formId = useId();
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
			className='nodrag nopan nowheel pointer-events-auto m-auto! max-h-[90vh]
			w-[min(700px,90vw)]! cursor-auto overflow-auto'
		>
			<FormProvider {...formMethods}>
				<Dialog.Header className='[&_.eds-icon]:size-5!'>
					<Dialog.Title className='text-text-default! font-[inherit]! text-2xl! leading-8! font-bold!'>
						Edit Issue
					</Dialog.Title>
				</Dialog.Header>
				<Dialog.Content>
					<form id={formId} onSubmit={onSubmit}>
						<fieldset disabled={isPending} className='flex w-full flex-col gap-4'>
							<IssueFormSection />
							{selectedType === 'Decision' && <DecisionFormSection />}
							{selectedType === 'Uncertainty' && <UncertaintyFormSection />}
						</fieldset>
					</form>
				</Dialog.Content>
				<Dialog.Actions>
					<Button type='button' variant='secondary' onClick={handleClose}>
						Cancel
					</Button>
					<Button
						type='submit'
						form={formId}
						disabled={isPending}
						aria-label='Update Issue'
						aria-busy={isPending}
					>
						{isPending ? <CircularProgress size={16} /> : 'Update Issue'}
					</Button>
				</Dialog.Actions>
			</FormProvider>
		</Dialog>
	);
};

type EditIssueModalProps = {
	issue: Issue;
	open?: boolean;
	onClose: (value: boolean) => void;
};
