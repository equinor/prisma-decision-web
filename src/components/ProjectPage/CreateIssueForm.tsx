import { Button, CircularProgress } from '@equinor/eds-core-react';
import { DevTool } from '@hookform/devtools';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { useLocalStorage } from '@uidotdev/usehooks';
import { FormProvider, useWatch } from 'react-hook-form';
import { useIssueForm } from '../../hooks/useIssueForm';
import { DecisionFormSection } from '../common/DecisionFormSection';
import { IssueFormSection } from '../common/IssueFormSection';
import { UncertaintyFormSection } from '../common/UncertaintyFormSection';
import { ValueFormSection } from '../common/ValueFormSection';

export const CreateIssues = () => {
	const formMethods = useIssueForm();
	const { control, isPending, onSubmit } = formMethods;
	const selectedType = useWatch({
		control,
		name: 'type',
	});

	const [isOpen, setIsOpen] = useLocalStorage('createIssueOpen', true);
	return (
		<Collapsible open={isOpen} onOpenChange={setIsOpen}>
			<FormProvider {...formMethods}>
				<form
					onSubmit={onSubmit}
					className='bg-background-default shadow-tile flex flex-col items-start gap-6 rounded-sm p-6'
				>
					<DevTool control={control} />
					<CollapsibleTrigger asChild>
						<div className='w-full cursor-pointer'>
							<h2 className='text-2xl font-semibold'>Create Issue</h2>
							<p className='text-text-tertiary'>
								Add issues related to decisions, uncertainties, and value drivers
							</p>
						</div>
					</CollapsibleTrigger>
					<CollapsibleContent className='flex w-full flex-col gap-6'>
						<IssueFormSection />
						{selectedType === 'Decision' && <DecisionFormSection />}
						{selectedType === 'Uncertainty' && <UncertaintyFormSection />}
						{selectedType === 'Value' && <ValueFormSection />}
						<Button className='md:self-end' type='submit'>
							{isPending ? <CircularProgress size={16} /> : 'Add Issue'}
						</Button>
					</CollapsibleContent>
				</form>
			</FormProvider>
		</Collapsible>
	);
};
