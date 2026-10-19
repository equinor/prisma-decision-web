import { Button, CircularProgress } from '@equinor/eds-core-react';
import { TextArea, TextField } from '@equinor/eds-core-react/next';
import { useDecisionQualityAssessmentForm } from '../../../hooks/useDecisionQualityAssessmentForm';
import { Assessment, evaluationMetrics } from '../../../validators';
import { FormErrorMessage } from '../../common/FormErrorMessage';
import { ErrorMessage } from '@hookform/error-message';

type DecisionQualityAssessmentFormProps = {
	assessment: Assessment;
};
export const DecisionQualityAssessmentForm = ({
	assessment,
}: DecisionQualityAssessmentFormProps) => {
	const {
		handleSubmit,
		isPending,
		formMethods: {
			formState: { errors },
			register,
		},
	} = useDecisionQualityAssessmentForm({
		assessmentId: assessment.id,
		projectId: assessment.project_id,
	});

	return (
		<form
			onSubmit={handleSubmit}
			className='bg-background-default shadow-tile col-span-full rounded-sm p-5'
		>
			<div className='mb-4'>
				<h3 className='text-lg font-semibold'>{assessment.name ?? 'New Evaluation'}</h3>
				<p className='text-text-tertiary text-sm'>
					Rate each metric from 0 to 5 to evaluate this project.
				</p>
			</div>

			<div className='space-y-4'>
				<div className='grid grid-cols-3 gap-2 [@media(min-width:1400px)]:grid-cols-6'>
					{evaluationMetrics.map(m => {
						return (
							<div key={m.key} className='flex flex-col gap-1'>
								<TextField
									label={m.label}
									type='number'
									min={0}
									max={5}
									step={1}
									{...register(m.key, {
										setValueAs: value => {
											return Number(value);
										},
									})}
									indicator='0-5'
								/>
								<ErrorMessage as={FormErrorMessage} name={m.key} errors={errors} />
							</div>
						);
					})}
				</div>
			</div>

			<div className='border-background-medium mt-4 border-t pt-4'>
				<div className='flex flex-col gap-1'>
					<TextArea
						label='Comment (optional)'
						placeholder='Add any notes about this evaluation...'
						rows={2}
						{...register('comment')}
					/>
					<ErrorMessage as={FormErrorMessage} name='comment' errors={errors} />
				</div>
			</div>

			<div className='mt-4 flex justify-end'>
				<Button type='submit' disabled={isPending}>
					{isPending ? <CircularProgress size={16} /> : 'Submit Evaluation'}
				</Button>
			</div>
		</form>
	);
};
