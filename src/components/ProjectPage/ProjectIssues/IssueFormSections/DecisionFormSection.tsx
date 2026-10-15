import { Button, Icon, TextField } from '@equinor/eds-core-react/next';
import { useFieldArray, useWatch } from 'react-hook-form';
import { add, delete_to_trash } from '@equinor/eds-icons';
import { useIssueFormContext } from '../../../../hooks/useIssueForm';
import { decisionTypes } from '../../../../validators';
import { SegmentedSelector } from '../../../common/SegmentedSelector';

const decisionTypeDescriptions = {
	Policy: 'Already decided or taken as given. Not decided in this project.',
	Focus: 'The main choice to be made in this project.',
	Tactical: 'Supporting choices needed to implement the focus decision.',
};

export const DecisionFormSection = () => {
	const {
		control,
		register,
		formState: { errors },
	} = useIssueFormContext();
	const {
		fields: options,
		append,
		remove,
	} = useFieldArray({
		control,
		name: 'decision.options',
	});
	const decisionId = useWatch({
		control,
		name: 'decision.id',
	});
	const projectId = useWatch({
		control,
		name: 'project_id',
	});

	const decisionType = useWatch({
		control,
		name: 'decision.type',
	});

	return (
		<div className='flex w-full flex-col gap-4'>
			<h3 className='text-lg font-semibold'>Decision Details</h3>
			<SegmentedSelector
				label='Decision type'
				{...register('decision.type')}
				value={decisionType}
				options={decisionTypes.map(value => ({ value, label: value }))}
				description={decisionTypeDescriptions[decisionType]}
			/>
			<div className='grid w-full grid-cols-1 gap-4'>
				{options.map((field, index) => (
					<div
						key={field.id}
						className='grid grid-cols-[minmax(0,1fr)_minmax(4rem,8rem)_auto] gap-2'
					>
						<TextField
							placeholder={`Option ${index + 1}...`}
							label={`Option ${index + 1}`}
							{...register(`decision.options.${index}.name`)}
							invalid={!!errors.decision?.options?.[index]?.name}
							helperMessage={errors.decision?.options?.[index]?.name?.message}
						/>
						<TextField
							label='Utility'
							{...register(`decision.options.${index}.utility`, {
								setValueAs: value => {
									const num = parseFloat(value);
									return isNaN(num) ? 0 : num;
								},
							})}
							type='number'
							step='any'
							invalid={!!errors.decision?.options?.[index]?.utility}
							helperMessage={errors.decision?.options?.[index]?.utility?.message}
						/>
						<Button
							type='button'
							variant='ghost'
							icon
							aria-label={`Remove Option ${index + 1}`}
							onClick={() => remove(index)}
							className='mt-5'
						>
							<Icon data={delete_to_trash} />
						</Button>
					</div>
				))}
				<Button
					type='button'
					variant='ghost'
					onClick={() =>
						append({
							name: '',
							id: crypto.randomUUID(),
							decision_id: decisionId,
							project_id: projectId,
							utility: 0,
							created_at: new Date().toISOString(),
						})
					}
					className='self-start'
				>
					<Icon data={add} size='sm' />
					Add Option
				</Button>
			</div>
		</div>
	);
};
