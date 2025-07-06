import { Button, Icon, TextField } from '@equinor/eds-core-react';
import { useFieldArray } from 'react-hook-form';
import { delete_to_trash } from '@equinor/eds-icons';
import { useIssueFormContext } from '../../hooks/useIssueForm';

export const DecisionFormSection = () => {
	const { control, register } = useIssueFormContext();
	const {
		fields: alternatives,
		append,
		remove,
	} = useFieldArray({
		control,
		name: 'decision.alternatives',
	});

	return (
		<div className='flex flex-col gap-4'>
			<h3 className='text-lg font-semibold'>Decision Details</h3>
			<div className='grid w-full grid-cols-1 gap-4'>
				{alternatives.map((field, index) => (
					<div key={field.id} className='flex gap-2'>
						<TextField
							placeholder={`Alternative ${index + 1}...`}
							label={`Alternative ${index + 1}`}
							{...register(`decision.alternatives.${index}.name`)}
							className='flex-1'
						/>
						<Button
							variant='ghost_icon'
							onClick={() => remove(index)}
							className='self-end'
						>
							<Icon data={delete_to_trash} />
						</Button>
					</div>
				))}
				<Button
					variant='outlined'
					onClick={() => append({ name: '', id: crypto.randomUUID() })}
					className='self-start'
				>
					Add Alternative
				</Button>
			</div>
		</div>
	);
};
