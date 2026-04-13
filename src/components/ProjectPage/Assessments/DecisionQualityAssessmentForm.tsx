import { Button, CircularProgress, Textarea, TextField } from '@equinor/eds-core-react';
import {
	PolarAngleAxis,
	PolarGrid,
	Radar,
	RadarChart,
	ResponsiveContainer,
	Tooltip,
} from 'recharts';
import { evaluationMetrics } from '../../../validators';
import { useDecisionQualityAssessmentForm } from '../../../hooks/useDecisionQualityAssessmentForm';

type DecisionQualityAssessmentFormProps = {
	assessmentId: string;
	assessmentName?: string;
	onSubmitted?: () => void;
};

export const DecisionQualityAssessmentForm = ({
	assessmentId,
	assessmentName,
	onSubmitted,
}: DecisionQualityAssessmentFormProps) => {
	const { handleSubmit, isPending, watch, setValue } = useDecisionQualityAssessmentForm({
		assessmentId,
		onSuccess: onSubmitted,
	});

	const metrics = watch();
	const chartData = evaluationMetrics.map(m => ({
		metric: m.label,
		score: metrics[m.key as keyof typeof metrics] ?? 0,
		fullMark: 10,
	}));

	return (
		<form onSubmit={handleSubmit}>
			<div className='mb-4'>
				<h3 className='text-lg font-semibold'>{assessmentName ?? 'New Evaluation'}</h3>
				<p className='text-text-tertiary text-sm'>
					Rate each metric from 0 to 10 to evaluate this project.
				</p>
			</div>

			<div className='grid grid-cols-2 items-start gap-4'>
				<div className='flex flex-col gap-3'>
					{evaluationMetrics.map(m => (
						<TextField
							key={m.key}
							label={m.label}
							type='number'
							value={Number(metrics[m.key as keyof typeof metrics]) || 0}
							onChange={e => {
								const num = parseFloat(e.target.value);
								setValue(
									m.key as keyof typeof metrics,
									isNaN(num) ? 0 : Math.min(10, Math.max(0, num)),
								);
							}}
							meta='0–10'
						/>
					))}
				</div>
				<div className='h-52'>
					<ResponsiveContainer
						width='100%'
						height='100%'
						className='[&_.recharts-polar-angle-axis-tick-value]:fill-text-default
							[&_.recharts-polar-angle-axis-tick-value]:text-xs
							[&_.recharts-polar-angle-axis-tick-value]:font-medium
							[&_.recharts-surface]:outline-0!'
					>
						<RadarChart data={chartData}>
							<PolarGrid
								radialLines={false}
								className='stroke-gray-500/50 stroke-2'
							/>
							<PolarAngleAxis dataKey='metric' />
							<Tooltip
								content={({ active, payload }) => {
									if (active && payload && payload.length) {
										return (
											<div className='rounded-sm bg-black p-2 text-sm font-medium text-white'>{`${payload[0].value}/10`}</div>
										);
									}
									return null;
								}}
								cursor={false}
							/>
							<Radar
								className='stroke-primary-resting fill-primary-resting stroke-3'
								name='Score'
								dataKey='score'
								fillOpacity={0.5}
								isAnimationActive={false}
							/>
						</RadarChart>
					</ResponsiveContainer>
				</div>
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
