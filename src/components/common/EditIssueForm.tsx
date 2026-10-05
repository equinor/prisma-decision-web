import { Button, CircularProgress, Icon } from '@equinor/eds-core-react';
import { close } from '@equinor/eds-icons';
import { FormProvider, useWatch } from 'react-hook-form';
import { useIssueForm } from '../../hooks/useIssueForm';
import { Issue } from '../../validators';
import { DecisionFormSection } from '../ProjectPage/ProjectIssues/IssueFormSections/DecisionFormSection';
import { IssueFormSection } from '../ProjectPage/ProjectIssues/IssueFormSections/IssueFormSection';
import { UncertaintyFormSection } from '../ProjectPage/ProjectIssues/IssueFormSections/UncertaintyFormSection';

export const EditIssueForm = ({ issue, onClose, onSuccess, hideHeader }: EditIssueFormProps) => {
	const formMethods = useIssueForm({ issue, onSuccess });
	const { control, onSubmit, isPending, reset } = formMethods;
	const selectedType = useWatch({
		control,
		name: 'type',
	});

	const handleClose = () => {
		onClose();
		reset();
	};

	return (
		<FormProvider {...formMethods}>
			<form onSubmit={onSubmit} className='flex flex-col gap-4'>
				{!hideHeader && (
					<div className='flex items-center justify-between'>
						<h2 className='text-2xl font-semibold'>Edit Issue</h2>
						<Button variant='ghost_icon' onClick={handleClose}>
							<Icon data={close} />
						</Button>
					</div>
				)}

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
	);
};

type EditIssueFormProps = {
	issue: Issue;
	onClose: () => void;
	onSuccess?: () => void;
	hideHeader?: boolean;
};
