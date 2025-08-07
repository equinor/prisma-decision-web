import { Button, CircularProgress, Icon, Popover } from '@equinor/eds-core-react';
import { add, close } from '@equinor/eds-icons';
import { DevTool } from '@hookform/devtools';
import { useRef, useState } from 'react';
import { FormProvider, useWatch } from 'react-hook-form';
import { useIssueForm } from '../../hooks/useIssueForm';
import { DecisionFormSection } from '../common/IssueFormSections/DecisionFormSection';
import { IssueFormSection } from '../common/IssueFormSections/IssueFormSection';
import { UncertaintyFormSection } from '../common/IssueFormSections/UncertaintyFormSection';
import { ValueMetricFormSection } from '../common/IssueFormSections/ValueMetricFormSection';

export const CreateIssues = () => {
	const formMethods = useIssueForm();
	const { control, isPending, onSubmit } = formMethods;
	const selectedType = useWatch({
		control,
		name: 'type',
	});
	const referenceElement = useRef<HTMLButtonElement>(null);

	const [isOpen, setIsOpen] = useState(false);
	return (
		<>
			<Button
				ref={referenceElement}
				variant='outlined'
				onClick={() => setIsOpen(prev => !prev)}
			>
				<Icon data={add} />
				Create Issue
			</Button>
			<Popover
				open={isOpen}
				onClick={() => setIsOpen(true)}
				anchorEl={referenceElement.current}
			>
				<Popover.Content className='relative w-[min(543px,_90vw)]'>
					<FormProvider {...formMethods}>
						<form
							onSubmit={onSubmit}
							className='flex flex-col items-start gap-4 rounded-sm'
						>
							<DevTool control={control} />
							<div className='w-full cursor-pointer pr-16'>
								<h2 className='text-2xl font-semibold'>Create Issue</h2>
								<p className='text-text-tertiary'>
									Add issues related to decisions, uncertainties, and value
									drivers
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
							<IssueFormSection />
							{selectedType === 'Decision' && <DecisionFormSection />}
							{selectedType === 'Uncertainty' && <UncertaintyFormSection />}
							{selectedType === 'Value Metric' && <ValueMetricFormSection />}
							<Button className='md:self-end' type='submit'>
								{isPending ? <CircularProgress size={16} /> : 'Add Issue'}
							</Button>
						</form>
					</FormProvider>
				</Popover.Content>
			</Popover>
		</>
	);
};
