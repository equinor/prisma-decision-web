import { Button, CircularProgress, Textarea, TextField } from '@equinor/eds-core-react';
import { useDecisionQualityAssessmentForm } from '../../../hooks/useDecisionQualityAssessmentForm';
import { Assessment, evaluationMetrics } from '../../../validators';

type DecisionQualityAssessmentFormProps = {
	assessment: Assessment;
};

export const DecisionQualityAssessmentForm = ({
	assessment,
}: DecisionQualityAssessmentFormProps) => {
	const { handleSubmit, isPending, watch, setValue } = useDecisionQualityAssessmentForm({
		assessmentId: assessment.id,
	});

	const metrics = watch();

	return (
		<form
			onSubmit={handleSubmit}
			className='bg-background-default shadow-tile col-span-full rounded-sm p-5'
		>
			<div className='mb-4'>
				<h3 className='text-lg font-semibold'>{assessment.name ?? 'New Evaluation'}</h3>
				<p className='text-text-tertiary text-sm'>
					Rate each metric from 0 to 100 to evaluate this project.
				</p>
			</div>

			<div className='grid grid-cols-3 gap-2 [@media(min-width:1400px)]:grid-cols-6'>
				{evaluationMetrics.map(m => (
					<TextField
						key={m.key}
						label={m.label}
						type='number'
						value={Number(metrics[m.key]) || 0}
						onChange={e => {
							const num = parseFloat(e.target.value);
							setValue(m.key, isNaN(num) ? 0 : Math.min(100, Math.max(0, num)));
						}}
						meta='0-100'
					/>
				))}
			</div>

			<div className='border-background-medium mt-4 border-t pt-4'>
				<Textarea
					label='Comment (optional)'
					placeholder='Add any notes about this evaluation...'
					rows={2}
					onChange={e => setValue('comment', e.target.value)}
					value={String(metrics.comment ?? '')}
				/>
			</div>

			<div className='mt-4 flex justify-end'>
				<Button type='submit' disabled={isPending}>
					{isPending ? <CircularProgress size={16} /> : 'Submit Evaluation'}
				</Button>
			</div>
		</form>
	);
};
