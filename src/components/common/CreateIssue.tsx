import { CircularProgress, Popover } from '@equinor/eds-core-react';
import { Button, Icon } from '@equinor/eds-core-react/next';
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
				type='button'
				variant='secondary'
				onClick={() => setIsOpen(prev => !prev)}
			>
				<Icon data={add} />
				Create Issue
			</Button>
			<Popover
				open={isOpen}
				onClose={() => setIsOpen(false)}
				anchorEl={referenceElement.current}
				className='[&>div:last-child]:max-w-none!'
			>
				<Popover.Content className='relative w-[min(640px,90vw)]'>
					<FormProvider {...formMethods}>
						<form
							onSubmit={onSubmit}
							className='flex flex-col items-start gap-4 rounded-sm'
						>
							<div className='w-full pr-16'>
								<h2 className='text-2xl font-bold'>Create Issue</h2>
								<p className='text-text-tertiary'>
									Add issues related to decisions, uncertainties, and value
									drivers
								</p>
							</div>
							<Button
								type='button'
								variant='ghost'
								icon
								aria-label='Close Create Issue'
								className='absolute! top-2 right-2'
								onClick={e => {
									e.stopPropagation();
									setIsOpen(false);
								}}
							>
								<Icon data={close} />
							</Button>
							<fieldset disabled={isPending} className='flex w-full flex-col gap-4'>
								<IssueFormSection />
								{selectedType === 'Decision' && <DecisionFormSection />}
								{selectedType === 'Uncertainty' && <UncertaintyFormSection />}
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
				</Popover.Content>
			</Popover>
		</>
	);
};
