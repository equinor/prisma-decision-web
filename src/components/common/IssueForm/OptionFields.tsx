import { Button, Icon, Radio, TextField } from '@equinor/eds-core-react/next';
import { add, delete_to_trash } from '@equinor/eds-icons';
import { useFieldArray, useWatch } from 'react-hook-form';
import { useInfluenceDiagramEvidence } from '../../../hooks/useInfluenceDiagramEvidence';
import { useIssueFormContext } from '../../../hooks/useIssueForm';
import { Issue } from '../../../validators';

export const OptionFields = ({ issue }: { issue?: Issue }) => {
	const {
		control,
		register,
		getValues,
		formState: { errors },
	} = useIssueFormContext();
	const { fields, append, remove } = useFieldArray({
		control,
		name: 'decision.options',
		keyName: 'fieldKey',
	});
	const options = useWatch({ control, name: 'decision.options' });
	const { evidence, toggleEvidence } = useInfluenceDiagramEvidence();
	const savedOptions = issue?.type === 'Decision' ? issue.decision.options : [];
	const selectedOption = savedOptions.find(option => evidence.includes(option.id));

	return (
		<section className={issue ? 'flex flex-col gap-2' : 'flex flex-col gap-4'}>
			{issue && (
				<p className='text-text-secondary flex h-9 items-center text-sm'>
					Forced decision: {selectedOption?.name ?? 'None'}
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
								aria-label={`Override option ${index + 1}`}
								name={`override-${issue.id}`}
								checked={selectedOption?.id === options[index]?.id}
								disabled={
									!savedOptions.some(option => option.id === options[index]?.id)
								}
								onClick={() => toggleEvidence(options[index].id, issue.id)}
								onChange={() => {}}
							/>
						)}
						<TextField
							label={
								issue
									? index === 0
										? 'Option name'
										: undefined
									: `Option ${index + 1}`
							}
							aria-label={issue ? `Option ${index + 1} name` : undefined}
							placeholder={issue ? undefined : `Option ${index + 1}...`}
							{...register(`decision.options.${index}.name`)}
							invalid={!!errors.decision?.options?.[index]?.name}
							helperMessage={errors.decision?.options?.[index]?.name?.message}
						/>
						<TextField
							label={!issue || index === 0 ? 'Utility' : undefined}
							aria-label={issue ? `Option ${index + 1} utility` : undefined}
							type='number'
							step='any'
							{...register(`decision.options.${index}.utility`, {
								setValueAs: value => Number.parseFloat(value) || 0,
							})}
							invalid={!!errors.decision?.options?.[index]?.utility}
							helperMessage={errors.decision?.options?.[index]?.utility?.message}
						/>
						<Button
							type='button'
							variant='ghost'
							icon
							aria-label={`Remove ${issue ? 'option' : 'Option'} ${index + 1}`}
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
						decision_id: getValues('decision.id'),
						utility: 0,
						created_at: new Date().toISOString(),
					})
				}
			>
				<Icon data={add} size='sm' />
				Add {issue ? 'option' : 'Option'}
			</Button>
		</section>
	);
};
