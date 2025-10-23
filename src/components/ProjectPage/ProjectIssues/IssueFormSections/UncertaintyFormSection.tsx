import { Button, Icon, TextField, Switch } from '@equinor/eds-core-react';
import { useFieldArray, useWatch } from 'react-hook-form';
import { delete_to_trash } from '@equinor/eds-icons';
import { ErrorMessage } from '@hookform/error-message';
import { useIssueFormContext } from '../../../../hooks/useIssueForm';
import { FormErrorMessage } from '../../../common/FormErrorMessage';

export const UncertaintyFormSection = () => {
	const { control, register } = useIssueFormContext();
	const outcomesArray = useFieldArray({
		control,
		name: 'uncertainty.outcomes',
	});
	const uncertaintyId = useWatch({
		control,
		name: 'uncertainty.id',
	});
	return (
		<div className='flex w-full flex-col gap-4'>
			<h3 className='text-lg font-semibold'>Uncertainty Details</h3>

			<div>
				<Switch label='Is Key' {...register('uncertainty.is_key')} />
				<ErrorMessage as={FormErrorMessage} name='uncertainty.is_key' />
			</div>

			<div className='grid grid-cols-1 gap-4'>
				{outcomesArray.fields.map((field, index) => (
					<div
						key={field.id}
						className='relative grid grid-cols-[3fr_1fr_1fr_auto] gap-2'
					>
						<div>
							<TextField
								placeholder={`Outcome ${index + 1}...`}
								label={`Outcome ${index + 1} Name`}
								{...register(`uncertainty.outcomes.${index}.name`)}
							/>
							<ErrorMessage
								as={FormErrorMessage}
								name={`uncertainty.outcomes.${index}.name`}
							/>
						</div>
						<div>
							<TextField
								type='number'
								step={0.01}
								min={0}
								max={1}
								label='Probability'
								{...register(`uncertainty.outcomes.${index}.probability`, {
									setValueAs: value => {
										const num = parseFloat(value);
										return isNaN(num) ? 0 : num;
									},
								})}
							/>
							<ErrorMessage
								as={FormErrorMessage}
								name={`uncertainty.outcomes.${index}.probability`}
							/>
						</div>
						<div>
							<TextField
								type='number'
								label='Utility'
								{...register(`uncertainty.outcomes.${index}.utility`, {
									setValueAs: value => {
										const num = parseFloat(value);
										return isNaN(num) ? 0 : num;
									},
								})}
							/>
							<ErrorMessage
								as={FormErrorMessage}
								name={`uncertainty.outcomes.${index}.utility`}
							/>
						</div>
						<Button
							variant='ghost_icon'
							onClick={() => outcomesArray.remove(index)}
							className='absolute top-3.5'
						>
							<Icon data={delete_to_trash} />
						</Button>
					</div>
				))}
				<Button
					variant='outlined'
					onClick={() =>
						outcomesArray.append({
							name: '',
							probability: 0,
							utility: 0,
							id: crypto.randomUUID(),
							uncertainty_id: uncertaintyId,
						})
					}
					className='self-start'
				>
					Add Outcome
				</Button>
				<ErrorMessage as={FormErrorMessage} name={'uncertainty.outcomes.sum'} />
			</div>
		</div>
	);
};
