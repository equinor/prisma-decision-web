import { TextField } from '@equinor/eds-core-react';
import { useIssueFormContext } from '../../../hooks/useIssueForm';

export const ValueMetricFormSection = () => {
	const { register } = useIssueFormContext();
	return (
		<div className='flex w-full flex-col gap-4'>
			<h3 className='text-lg font-semibold'>Value Metric Details</h3>
			<div className='grid w-full grid-cols-1 gap-4 md:grid-cols-2'>
				<TextField
					placeholder='Enter metric name...'
					label='Value Metric Name'
					{...register('value_metric.name')}
					className='md:col-span-2'
				/>
				<TextField
					type='number'
					placeholder='Enter value...'
					label='Value'
					{...register('utility.values.0', {
						valueAsNumber: true,
					})}
					className='md:col-span-2'
				/>
			</div>
		</div>
	);
};
