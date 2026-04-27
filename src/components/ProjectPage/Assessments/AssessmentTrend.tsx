import {
	ResponsiveContainer,
	LineChart,
	CartesianGrid,
	XAxis,
	YAxis,
	Tooltip,
	Legend,
	Line,
} from 'recharts';
import { useGetAssessments } from '../../../hooks/api/useGetAssessments';
import { useSelectedProject } from '../../../hooks/useSelectedProject';
import { getAveragedMetrics } from '../../../utils/getAveragedMetrics';
import { evaluationMetrics } from '../../../validators';
export const AssessmentTrend = () => {
	const { assessments } = useGetAssessments();
	const selectedProject = useSelectedProject();
	const projectAssessments = assessments
		.filter(a => a.project_id === selectedProject?.id)
		.toReversed();
	const completedAssessmentTrends = projectAssessments
		.filter(a => a.is_completed)
		.map(a => {
			const avg = getAveragedMetrics(a.decision_quality_assessments ?? []);
			return avg ? { name: a.name, ...avg } : null;
		});
	if (completedAssessmentTrends.length < 1) return null;
	return (
		<section className='bg-background-default shadow-tile rounded-md p-5'>
			<h2 className='mb-1 text-lg font-semibold'>Metric Trends</h2>
			<p className='text-text-tertiary mb-4 text-sm'>
				Averaged scores across completed assessments.
			</p>
			<div className='h-72'>
				<ResponsiveContainer
					width='100%'
					height='100%'
					className='[&_.recharts-cartesian-axis-tick-value]:fill-text-default
                            [&_.recharts-default-legend]:text-text-default
                            [&_.recharts-cartesian-axis-tick-value]:text-xs
                            [&_.recharts-cartesian-axis-tick-value]:font-medium
                            [&_.recharts-surface]:outline-0!'
				>
					<LineChart
						data={completedAssessmentTrends}
						margin={{ left: 12, right: 12, top: 8, bottom: 8 }}
					>
						<CartesianGrid className='stroke-gray-500/30' vertical={false} />
						<XAxis dataKey='name' tickLine={false} axisLine={false} tickMargin={8} />
						<YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
						<Tooltip cursor={false} />
						<Legend />
						{evaluationMetrics.map(metric => (
							<Line
								key={metric.key}
								type='monotone'
								dataKey={metric.key}
								name={metric.label}
								stroke={
									METRIC_LINE_COLORS[metric.key] ??
									'rgba(var(--eds_primary_resting), 1)'
								}
								strokeWidth={2}
								dot={false}
								isAnimationActive={false}
							/>
						))}
					</LineChart>
				</ResponsiveContainer>
			</div>
		</section>
	);
};

const METRIC_LINE_COLORS: Record<string, string> = {
	appropriate_frame: 'rgba(var(--eds_primary_resting), 1)',
	trade_off_analysis: 'rgba(var(--eds_warning_resting), 1)',
	reasoning_correctness: 'rgba(var(--eds_text_success), 1)',
	information_reliability: 'rgba(var(--eds_danger_text), 1)',
	doable_alternatives: 'rgba(var(--eds_text_secondary), 1)',
	commitment_to_action: '#6366f1',
};
