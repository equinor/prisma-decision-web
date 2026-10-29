import { Button, Icon, TextField, Switch } from '@equinor/eds-core-react/next';
import { useController, useFieldArray, useWatch } from 'react-hook-form';
import { add, delete_to_trash } from '@equinor/eds-icons';
import { useIssueFormContext } from '../../../../hooks/useIssueForm';

export const UncertaintyFormSection = () => {
	const {
		control,
		register,
		formState: { errors },
	} = useIssueFormContext();
	const { field: isKeyField } = useController({ control, name: 'uncertainty.is_key' });
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
	return (
		<div className='flex w-full flex-col gap-4'>
			<h3 className='text-lg font-semibold'>Uncertainty Details</h3>

			<div>
				<Switch
					label='Is Key'
					name={isKeyField.name}
					ref={isKeyField.ref}
					onBlur={isKeyField.onBlur}
					checked={isKeyField.value}
					onChange={event => isKeyField.onChange(event.target.checked)}
				/>
			</div>

			<div className='grid grid-cols-1 gap-4'>
				{outcomesArray.map((field, index) => (
					<div
						key={field.id}
						className='grid grid-cols-[minmax(0,1fr)_minmax(4rem,8rem)_auto] gap-2'
					>
						<TextField
							placeholder={`Outcome ${index + 1}...`}
							label={`Outcome ${index + 1} Name`}
							{...register(`uncertainty.outcomes.${index}.name`)}
							invalid={!!errors.uncertainty?.outcomes?.[index]?.name}
							helperMessage={errors.uncertainty?.outcomes?.[index]?.name?.message}
						/>
						<TextField
							type='number'
							label='Utility'
							{...register(`uncertainty.outcomes.${index}.utility`, {
								setValueAs: value => {
									const num = parseFloat(value);
									return isNaN(num) ? 0 : num;
								},
							})}
							step='any'
							invalid={!!errors.uncertainty?.outcomes?.[index]?.utility}
							helperMessage={errors.uncertainty?.outcomes?.[index]?.utility?.message}
						/>
						<Button
							type='button'
							variant='ghost'
							icon
							aria-label={`Remove Outcome ${index + 1}`}
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
							uncertainty_id: uncertaintyId,
							project_id: projectId,
							utility: 0,
							created_at: new Date().toISOString(),
						})
					}
					className='self-start'
				>
					<Icon data={add} size='sm' />
					Add Outcome
				</Button>
			</div>
		</div>
	);
};
