import { Button, Icon, TextField, Autocomplete } from '@equinor/eds-core-react';
import { useFieldArray, useWatch } from 'react-hook-form';
import { delete_to_trash } from '@equinor/eds-icons';
import { useIssueFormContext } from '../../../../hooks/useIssueForm';
import { ErrorMessage } from '@hookform/error-message';
import { FormErrorMessage } from '../../../common/FormErrorMessage';
import { useController } from 'react-hook-form';
import { decisionTypes } from '../../../../validators';

export const DecisionFormSection = () => {
	const { control, register } = useIssueFormContext();
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

	const {
		field: {
			onChange: onChangeDecisionType,
			ref: decisionTypeRef,
			value: selectedDecisionType,
		},
	} = useController({
		control,
		name: 'decision.type',
	});

	return (
		<div className='flex w-full flex-col gap-4'>
			<h3 className='text-lg font-semibold'>Decision Details</h3>
			<div>
				<Autocomplete
					label='Decision Type'
					options={decisionTypes}
					selectedOptions={[selectedDecisionType]}
					hideClearButton
					ref={decisionTypeRef}
					onOptionsChange={({ selectedItems }) => {
						if (selectedItems.length === 0) return;
						onChangeDecisionType(selectedItems[0]);
					}}
				/>
				<ErrorMessage as={FormErrorMessage} name='decision.type' />
			</div>{' '}
			<div className='grid w-full grid-cols-1 gap-4'>
				{options.map((field, index) => (
					<div key={field.id} className='relative grid grid-cols-[1fr_8rem_auto] gap-2'>
						<div>
							<TextField
								placeholder={`Option ${index + 1}...`}
								label={`Option ${index + 1}`}
								{...register(`decision.options.${index}.name`)}
								className='flex-1'
							/>
							<ErrorMessage
								as={FormErrorMessage}
								name={`decision.options.${index}.name`}
							/>
						</div>
						<div>
							<TextField
								label='Utility'
								{...register(`decision.options.${index}.utility`, {
									setValueAs: value => {
										const num = parseFloat(value);
										return isNaN(num) ? 0 : num;
									},
								})}
								className='flex-1'
								type='number'
								step={0.01}
							/>
							<ErrorMessage
								as={FormErrorMessage}
								name={`decision.options.${index}.utility`}
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
							decision_id: decisionId,
							utility: 0,
							created_at: new Date().toISOString(),
						})
					}
					className='self-start'
				>
					Add Option
				</Button>
			</div>
		</div>
	);
};
