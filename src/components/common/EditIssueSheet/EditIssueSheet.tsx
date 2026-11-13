import { Dialog } from '@ariakit/react';
import { Button } from '@equinor/eds-core-react/next';
import { useId, useState } from 'react';
import { FormProvider, useWatch } from 'react-hook-form';
import { useInfluenceDiagramEvidence } from '../../../hooks/useInfluenceDiagramEvidence';
import { useIssueForm } from '../../../hooks/useIssueForm';
import { Issue } from '../../../validators';
import { DeleteIssueDialog } from '../DeleteIssueDialog';
import { DecisionForm } from './DecisionForm';
import { FactForm } from './FactForm';
import { IssueSheetHeader } from './IssueSheetHeader';
import { IssueSheetTabs } from './IssueSheetTabs';
import { UnassignedForm } from './UnassignedForm';
import { UncertaintyForm } from './UncertaintyForm';
import { UtilityForm } from './UtilityForm';

const issueForms = {
	Decision: DecisionForm,
	Uncertainty: UncertaintyForm,
	Fact: FactForm,
	Unassigned: UnassignedForm,
	Utility: UtilityForm,
};

export const EditIssueSheet = ({
	issue,
	onClose,
	open = false,
	dialog = true,
}: EditIssueSheetProps) =>
	open ? (
		<IssueSheet key={issue.id} issue={issue} dialog={dialog} onClose={() => onClose(false)} />
	) : null;

const IssueSheet = ({
	issue,
	onClose,
	dialog,
}: {
	issue: Issue;
	onClose: () => void;
	dialog: boolean;
}) => {
	const formId = useId();
	const [deleteOpen, setDeleteOpen] = useState(false);
	const { evidence, clearEvidence } = useInfluenceDiagramEvidence();
	const form = useIssueForm({
		issue,
		onSuccess: () => {
			const updated = form.getValues();
			form.reset(updated);
			const states =
				updated.type === 'Decision'
					? updated.decision.options
					: updated.type === 'Uncertainty'
						? updated.uncertainty.outcomes
						: [];
			const previousStates =
				issue.type === 'Decision' ? issue.decision.options : issue.uncertainty.outcomes;
			if (
				updated.type !== issue.type ||
				previousStates.some(
					state =>
						evidence.includes(state.id) && !states.some(next => next.id === state.id),
				)
			)
				clearEvidence(updated.id);
		},
	});
	const {
		control,
		onSubmit,
		isPending,
		formState: { isDirty },
	} = form;
	const type = useWatch({ control, name: 'type' });
	const typeLabel = type.toLowerCase();
	const TypeForm = issueForms[type];

	return (
		<Dialog
			open
			onClose={onClose}
			modal={dialog}
			portal
			backdrop={dialog ? <div className='bg-black/40' /> : false}
			preventBodyScroll={dialog}
			hideOnInteractOutside={dialog && !deleteOpen}
			hideOnEscape={!deleteOpen}
			aria-label='Edit Issue'
			data-no-dnd
			className='nodrag nopan nowheel bg-background-default text-text-default pointer-events-auto fixed inset-y-0 right-0 z-50 flex h-dvh w-125 max-w-full flex-col shadow-xl outline-none'
		>
			<FormProvider {...form}>
				<div className='flex min-h-0 flex-1 flex-col gap-4 overflow-auto p-4'>
					<IssueSheetHeader issue={issue} disabled={isPending} />
					<IssueSheetTabs issue={issue} pending={isPending}>
						<form
							id={formId}
							onSubmit={event => {
								if (!isDirty || isPending) {
									event.preventDefault();
									return;
								}
								void onSubmit(event);
							}}
						>
							<fieldset disabled={isPending} className='flex min-w-0 flex-col gap-4'>
								<TypeForm issue={issue} />
							</fieldset>
						</form>
					</IssueSheetTabs>
				</div>
				<footer className='border-background-medium flex min-h-17.25 shrink-0 flex-wrap items-center justify-end gap-2 border-t p-4'>
					<Button
						variant='ghost'
						tone='danger'
						className='mr-auto'
						disabled={isPending}
						onClick={() => setDeleteOpen(true)}
					>
						Delete {typeLabel}
					</Button>
					<Button variant='ghost' tone='neutral' onClick={onClose}>
						{isDirty ? 'Discard changes' : 'Close'}
					</Button>
					<Button
						type='submit'
						form={formId}
						disabled={!isDirty || isPending}
						aria-busy={isPending}
					>
						Update {typeLabel}
					</Button>
				</footer>
			</FormProvider>
			{deleteOpen && (
				<DeleteIssueDialog issue={issue} open onClose={() => setDeleteOpen(false)} />
			)}
		</Dialog>
	);
};

type EditIssueSheetProps = {
	issue: Issue;
	open?: boolean;
	dialog?: boolean;
	onClose: (value: boolean) => void;
};
