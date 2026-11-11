import { CircularProgress } from '@equinor/eds-core-react';
import { Button, Icon } from '@equinor/eds-core-react/next';
import { close } from '@equinor/eds-icons';
import { FormProvider, useWatch } from 'react-hook-form';
import type { useIssueForm } from '../../../hooks/useIssueForm';
import { IssueForm } from '../IssueForm/IssueForm';
import { CreateDecisionForm } from './CreateDecisionForm';
import { CreateUncertaintyForm } from './CreateUncertaintyForm';

type CreateIssueFormProps = {
	formMethods: ReturnType<typeof useIssueForm>;
	onClose: () => void;
};

export const CreateIssueForm = ({ formMethods, onClose }: CreateIssueFormProps) => {
	const { control, isPending, onSubmit } = formMethods;
	const selectedType = useWatch({
		control,
		name: 'type',
	});

	return (
		<FormProvider {...formMethods}>
			<form onSubmit={onSubmit} className='flex flex-col items-start gap-4 rounded-sm'>
				<div className='w-full pr-16'>
					<h2 className='text-2xl font-bold'>Create Issue</h2>
					<p className='text-text-tertiary'>
						Add issues related to decisions, uncertainties, and value drivers
					</p>
				</div>
				<Button
					type='button'
					variant='ghost'
					icon
					aria-label='Close Create Issue'
					className='absolute! top-2 right-2'
					onClick={event => {
						event.stopPropagation();
						onClose();
					}}
				>
					<Icon data={close} />
				</Button>
				<fieldset disabled={isPending} className='flex w-full flex-col gap-4'>
					<IssueForm>
						<IssueForm.Name />
						<IssueForm.Description />
						<IssueForm.Type />
						<IssueForm.Boundary />
						{selectedType === 'Decision' && <CreateDecisionForm />}
						{selectedType === 'Uncertainty' && <CreateUncertaintyForm />}
					</IssueForm>
				</fieldset>
				<Button
					className='md:self-end'
					type='submit'
					disabled={isPending}
					aria-label='Add Issue'
					aria-busy={isPending}
				>
					{isPending ? <CircularProgress size={16} /> : 'Add Issue'}
				</Button>
			</form>
		</FormProvider>
	);
};
