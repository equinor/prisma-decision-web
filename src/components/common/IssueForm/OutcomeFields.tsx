import { Button, Icon, Radio, TextField } from '@equinor/eds-core-react/next';
import { add, delete_to_trash } from '@equinor/eds-icons';
import { useFieldArray, useWatch } from 'react-hook-form';
import { useInfluenceDiagramEvidence } from '../../../hooks/useInfluenceDiagramEvidence';
import { useIssueFormContext } from '../../../hooks/useIssueForm';
import { Issue } from '../../../validators';

export const OutcomeFields = ({ issue }: { issue?: Issue }) => {
	const {
		control,
		register,
		getValues,
		formState: { errors },
	} = useIssueFormContext();
	const { fields, append, remove } = useFieldArray({
		control,
		name: 'uncertainty.outcomes',
		keyName: 'fieldKey',
	});
	const outcomes = useWatch({ control, name: 'uncertainty.outcomes' });
	const { evidence, toggleEvidence } = useInfluenceDiagramEvidence();
	const savedOutcomes = issue?.type === 'Uncertainty' ? issue.uncertainty.outcomes : [];
	const selectedOutcome = savedOutcomes.find(outcome => evidence.includes(outcome.id));

	return (
		<section className={issue ? 'flex flex-col gap-2' : 'flex flex-col gap-4'}>
			{issue && (
				<p className='text-text-secondary flex h-9 items-center text-sm'>
					Hard evidence: {selectedOutcome?.name ?? 'None'}
				</p>
			)}
			<div className={issue ? 'flex flex-col gap-3' : 'flex flex-col gap-4'}>
				{fields.map((field, index) => (
					<div
						key={field.fieldKey}
						className={
							issue
								? 'grid grid-cols-[2.25rem_minmax(0,1fr)_minmax(4rem,8rem)_2.25rem] items-end gap-2'
								: 'grid grid-cols-[minmax(0,1fr)_minmax(4rem,8rem)_auto] gap-2'
						}
					>
						{issue && (
							<Radio
								aria-label={`Override outcome ${index + 1}`}
								name={`override-${issue.id}`}
								checked={selectedOutcome?.id === outcomes[index]?.id}
								disabled={
									!savedOutcomes.some(
										outcome => outcome.id === outcomes[index]?.id,
									)
								}
								onClick={() => toggleEvidence(outcomes[index].id, issue.id)}
								onChange={() => {}}
							/>
						)}
						<TextField
							label={
								issue
									? index === 0
										? 'Outcome name'
										: undefined
									: `Outcome ${index + 1} Name`
							}
							aria-label={issue ? `Outcome ${index + 1} name` : undefined}
							placeholder={issue ? undefined : `Outcome ${index + 1}...`}
							{...register(`uncertainty.outcomes.${index}.name`)}
							invalid={!!errors.uncertainty?.outcomes?.[index]?.name}
							helperMessage={errors.uncertainty?.outcomes?.[index]?.name?.message}
						/>
						<TextField
							label={!issue || index === 0 ? 'Utility' : undefined}
							aria-label={issue ? `Outcome ${index + 1} utility` : undefined}
							type='number'
							step='any'
							{...register(`uncertainty.outcomes.${index}.utility`, {
								setValueAs: value => Number.parseFloat(value) || 0,
							})}
							invalid={!!errors.uncertainty?.outcomes?.[index]?.utility}
							helperMessage={errors.uncertainty?.outcomes?.[index]?.utility?.message}
						/>
						<Button
							type='button'
							variant='ghost'
							icon
							aria-label={`Remove ${issue ? 'outcome' : 'Outcome'} ${index + 1}`}
							onClick={() => remove(index)}
							className={issue ? undefined : 'mt-5'}
						>
							<Icon data={delete_to_trash} size={issue ? 'sm' : undefined} />
						</Button>
					</div>
				))}
			</div>
			<Button
				type='button'
				variant={issue ? 'secondary' : 'ghost'}
				className={issue ? 'mt-2 self-start' : 'self-start'}
				onClick={() =>
					append({
						name: '',
						id: crypto.randomUUID(),
						project_id: getValues('project_id'),
						uncertainty_id: getValues('uncertainty.id'),
						utility: 0,
						created_at: new Date().toISOString(),
					})
				}
			>
				<Icon data={add} size='sm' />
				Add {issue ? 'outcome' : 'Outcome'}
			</Button>
		</section>
	);
};
