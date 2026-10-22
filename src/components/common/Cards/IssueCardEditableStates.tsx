import { Button, Icon } from '@equinor/eds-core-react/next';
import { add, chevron_down, chevron_up } from '@equinor/eds-icons';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { FormProvider, useFieldArray } from 'react-hook-form';
import { useExpandCard } from '../../../hooks/useExpandCard';
import { useIssueForm } from '../../../hooks/useIssueForm';
import { IssueCardEditableState } from './IssueCardEditableState';
import { useIssueCardContext } from './useIssueCardContext';

export const IssueCardEditableStates = () => {
	const { issue } = useIssueCardContext();
	const { expanded, toggle } = useExpandCard(issue.id);
	const form = useIssueForm({ issue, optimistic: true });
	const isUncertainty = issue.type === 'Uncertainty';
	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: isUncertainty ? 'uncertainty.outcomes' : 'decision.options',
		keyName: 'formId',
	});
	const states = isUncertainty ? issue.uncertainty.outcomes : issue.decision.options;
	const stateType = isUncertainty ? 'outcome' : 'option';

	const addState = () => {
		const common = {
			id: crypto.randomUUID(),
			project_id: issue.project_id,
			name: '',
			utility: 0,
			created_at: new Date().toISOString(),
		};
		append(
			issue.type === 'Uncertainty'
				? { ...common, uncertainty_id: issue.uncertainty.id }
				: { ...common, decision_id: issue.decision.id },
			{ shouldFocus: false },
		);
		if (!expanded) toggle();
	};

	return (
		<FormProvider {...form}>
			<Collapsible open={expanded} onOpenChange={toggle} className='flex flex-1 flex-col'>
				{fields.length > 0 && (
					<CollapsibleContent className='pt-2'>
						<ul className='mb-2 flex w-full flex-col gap-2 rounded-sm text-sm'>
							{fields.map((state, index) => {
								const isNew = !states.some(saved => saved.id === state.id);
								return (
									<IssueCardEditableState
										key={state.id}
										index={index}
										isNew={isNew}
										onSubmit={form.onSubmit}
										onRemove={() => {
											remove(index);
											if (!isNew) form.onSubmit();
										}}
									/>
								);
							})}
						</ul>
					</CollapsibleContent>
				)}
				{(expanded || states.length === 0) && (
					<Button
						type='button'
						data-card-action
						variant='ghost'
						size='small'
						className='pointer-events-auto mb-2 cursor-pointer self-start'
						onClick={addState}
					>
						<Icon data={add} size='sm' className='size-4!' />
						Add {stateType}
					</Button>
				)}
				{states.length > 0 && (
					<CollapsibleTrigger asChild>
						<Button
							type='button'
							data-card-action
							variant='ghost'
							size='small'
							className='text-text-tertiary pointer-events-auto mt-auto ml-auto flex cursor-pointer gap-2! p-0! pl-1.5! font-[inherit]! text-sm! leading-5! font-normal!'
						>
							{states.length} States
							<Icon
								data={expanded ? chevron_up : chevron_down}
								size='lg'
								className='text-primary-resting size-6!'
							/>
						</Button>
					</CollapsibleTrigger>
				)}
			</Collapsible>
		</FormProvider>
	);
};
