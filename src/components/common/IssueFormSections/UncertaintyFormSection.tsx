import { Button, Icon, TextField } from '@equinor/eds-core-react';
import { useFieldArray } from 'react-hook-form';
import { delete_to_trash } from '@equinor/eds-icons';
import { ErrorMessage } from '@hookform/error-message';
import { useIssueFormContext } from '../../../hooks/useIssueForm';
import { FormErrorMessage } from '../FormErrorMessage';

export const UncertaintyFormSection = () => {
	const { control, register } = useIssueFormContext();
	const probabilitiesArray = useFieldArray({
		control,
		name: 'uncertainty.probabilities',
	});

	return (
		<div className='flex w-full flex-col gap-4'>
			<h3 className='text-lg font-semibold'>Uncertainty Details</h3>
			<div className='grid grid-cols-1 gap-4'>
				{probabilitiesArray.fields.map((field, index) => (
					<div key={field.id} className='grid grid-cols-[3fr_1fr_auto] gap-2'>
						<div>
							<TextField
								placeholder={`Outcome ${index + 1}...`}
								label={`Outcome ${index + 1} Name`}
								{...register(`uncertainty.probabilities.${index}.name`)}
							/>
							<ErrorMessage
								as={FormErrorMessage}
								name={`uncertainty.probabilities.${index}.name`}
							/>
						</div>
						<div>
							<TextField
								type='number'
								step={0.01}
								placeholder='0.5'
								label='Probability'
								{...register(`uncertainty.probabilities.${index}.probability`, {
									valueAsNumber: true,
								})}
							/>
							<ErrorMessage
								as={FormErrorMessage}
								name={`uncertainty.probabilities.${index}.probability`}
							/>
						</div>
						<Button
							variant='ghost_icon'
							onClick={() => probabilitiesArray.remove(index)}
							className='self-end'
						>
							<Icon data={delete_to_trash} />
						</Button>
					</div>
				))}
				<Button
					variant='outlined'
					onClick={() => probabilitiesArray.append({ name: '', probability: 0 })}
					className='self-start'
				>
					Add Outcome
				</Button>
			</div>
		</div>
	);
};
