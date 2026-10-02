import { Button, Icon, TextField, Switch } from '@equinor/eds-core-react';
import { useFieldArray, useWatch } from 'react-hook-form';
import { delete_to_trash } from '@equinor/eds-icons';
import { ErrorMessage } from '@hookform/error-message';
import { useIssueFormContext } from '../../../../hooks/useIssueForm';
import { FormErrorMessage } from '../../../common/FormErrorMessage';
import { cn } from '../../../../utils/cn';
import { ForceState, ForceStateButton } from './ForceStateButton';

export const UncertaintyFormSection = ({ forceState }: { forceState?: ForceState }) => {
	const { control, register } = useIssueFormContext();
	const {
		fields: outcomesArray,
		append,
		remove,
	} = useFieldArray({
		control,
		name: 'uncertainty.outcomes',
	});
	const uncertaintyId = useWatch({
		control,
		name: 'uncertainty.id',
	});
	const projectId = useWatch({
		control,
		name: 'project_id',
	});
	const watchedOutcomes = useWatch({
		control,
		name: 'uncertainty.outcomes',
	});
	return (
		<div className='flex w-full flex-col gap-4'>
			<h3 className='text-lg font-semibold'>Uncertainty Details</h3>

			<div>
				<Switch label='Is Key' {...register('uncertainty.is_key')} />
				<ErrorMessage as={FormErrorMessage} name='uncertainty.is_key' />
			</div>

			<div className='grid grid-cols-1 gap-4'>
				{outcomesArray.map((field, index) => (
					<div
						key={field.id}
						className={cn('relative grid grid-cols-[1fr_8rem_auto] gap-2', {
							'grid-cols-[auto_1fr_8rem_auto]': forceState,
						})}
					>
						{forceState && (
							<ForceStateButton
								forceState={forceState}
								stateId={watchedOutcomes[index]?.id}
								label='outcome'
							/>
						)}
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
								label='Utility'
								{...register(`uncertainty.outcomes.${index}.utility`, {
									setValueAs: value => {
										const num = parseFloat(value);
										return isNaN(num) ? 0 : num;
									},
								})}
								step={0.01}
							/>
							<ErrorMessage
								as={FormErrorMessage}
								name={`uncertainty.outcomes.${index}.utility`}
							/>
						</div>
						<Button
							variant='ghost_icon'
							onClick={() => remove(index)}
							className='absolute top-3.5'
						>
							<Icon data={delete_to_trash} />
						</Button>
					</div>
				))}
				<Button
					variant='outlined'
					onClick={() =>
						append({
							name: '',
							id: crypto.randomUUID(),
							uncertainty_id: uncertaintyId,
							project_id: projectId,
							utility: 0,
							created_at: new Date().toISOString(),
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
