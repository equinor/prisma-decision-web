import { Button, Icon, TextField } from '@equinor/eds-core-react';
import { useFieldArray } from 'react-hook-form';
import { delete_to_trash } from '@equinor/eds-icons';
import { useIssueFormContext } from '../../hooks/useIssueForm';

export const UncertaintyFormSection = () => {
	const { control, register } = useIssueFormContext();
	const probabilitiesArray = useFieldArray({
		control,
		name: 'uncertainty.probabilities',
	});

	return (
		<div className='flex flex-col gap-4'>
			<h3 className='text-lg font-semibold'>Uncertainty Details</h3>
			<div className='grid w-full grid-cols-1 gap-4'>
				{probabilitiesArray.fields.map((field, index) => (
					<div key={field.id} className='grid grid-cols-[3fr_1fr_auto] gap-2'>
						<TextField
							placeholder={`Outcome ${index + 1}...`}
							label={`Outcome ${index + 1} Name`}
							{...register(`uncertainty.probabilities.${index}.name` as const)}
							className='flex-1'
						/>
						<TextField
							type='number'
							placeholder='0.5'
							label='Probability'
							{...register(
								`uncertainty.probabilities.${index}.probability` as const,
								{
									valueAsNumber: true,
								},
							)}
							className='w-32'
						/>
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
