import { Button, CircularProgress, Icon, Popover } from '@equinor/eds-core-react';
import { add, close } from '@equinor/eds-icons';
import { useRef, useState } from 'react';
import { FormProvider, useWatch } from 'react-hook-form';
import { useIssueForm } from '../../hooks/useIssueForm';
import { DecisionFormSection } from '../ProjectPage/ProjectIssues/IssueFormSections/DecisionFormSection';
import { IssueFormSection } from '../ProjectPage/ProjectIssues/IssueFormSections/IssueFormSection';
import { UncertaintyFormSection } from '../ProjectPage/ProjectIssues/IssueFormSections/UncertaintyFormSection';

export const CreateIssues = () => {
	const [isOpen, setIsOpen] = useState(false);
	const formMethods = useIssueForm({
		onSuccess: () => setIsOpen(false),
	});
	const { control, isPending, onSubmit } = formMethods;
	const selectedType = useWatch({
		control,
		name: 'type',
	});
	const referenceElement = useRef<HTMLButtonElement>(null);

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
				onClose={() => setIsOpen(false)}
				anchorEl={referenceElement.current}
			>
				<Popover.Content className='relative w-[min(543px,90vw)]'>
					<FormProvider {...formMethods}>
						<form
							onSubmit={onSubmit}
							className='flex flex-col items-start gap-4 rounded-sm'
						>
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
							<Button className='md:self-end' type='submit' disabled={isPending}>
								{isPending ? <CircularProgress size={16} /> : 'Add Issue'}
							</Button>
						</form>
					</FormProvider>
				</Popover.Content>
			</Popover>
		</>
	);
};
