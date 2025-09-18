import { useMemo } from 'react';
import { Table } from '@equinor/eds-core-react';
import {
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	PolarAngleAxis,
	PolarGrid,
	Radar,
	RadarChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';
import { DEFAULT_EVALUATION_METRICS, useEvaluations } from '../../../hooks/useEvaluations';
import { useSelectedProject } from '../../../hooks/useSelectedProject';

const METRIC_LINE_COLORS: Record<string, string> = {
	value: 'rgba(var(--eds_primary_resting), 1)',
	risk: 'rgba(var(--eds_warning_resting), 1)',
	cost: 'rgba(var(--eds_text_success), 1)',
	feasibility: 'rgba(var(--eds_danger_text), 1)',
	impact: 'rgba(var(--eds_text_secondary), 1)',
};

export const Assessments = () => {
	const { evaluations } = useEvaluations();
	const selectedProject = useSelectedProject();

	const sortedEvaluations = useMemo(
		() =>
			[...evaluations].sort(
				(a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
			),
		[evaluations],
	);

	const toChartData = (metrics: Record<string, number>) =>
		DEFAULT_EVALUATION_METRICS.map(m => ({
			metric: m.label,
			score: metrics[m.key],
			fullMark: 10,
		}));

	const metricTrendData = useMemo(
		() =>
			sortedEvaluations.map(ev => {
				const values = DEFAULT_EVALUATION_METRICS.reduce<Record<string, number>>(
					(acc, metric) => {
						acc[metric.key] = ev.metrics[metric.key] ?? 0;
						return acc;
					},
					{},
				);

				return {
					evaluation: ev.name,
					...values,
				};
			}),
		[sortedEvaluations],
	);

	const hasEvaluations = evaluations.length > 0;
	if (!selectedProject) return;
	return (
		<div className='flex flex-col gap-4'>
			<div className='flex items-center justify-between'>
				<h1 className='text-3xl font-bold'>{selectedProject.name}</h1>
			</div>
			<div className='grid grid-cols-1 gap-6 2xl:grid-cols-2'>
				{hasEvaluations ? (
					<>
						<div className='bg-background-default shadow-tile rounded-sm p-4 2xl:col-span-2'>
							<div className='mb-3 font-semibold'>Metric trends over evaluations</div>
							<div className='h-80'>
								<ResponsiveContainer
									width='100%'
									height='100%'
									className='[&_.recharts-cartesian-axis-tick-value]:fill-text-default
								[&_.recharts-default-legend]:text-text-default
								[&_.recharts-cartesian-axis-tick-value]:font-medium
								[&_.recharts-surface]:outline-0!'
								>
									<LineChart
										data={metricTrendData}
										margin={{ left: 12, right: 12, top: 8, bottom: 8 }}
									>
										<CartesianGrid
											className='stroke-gray-500/30'
											vertical={false}
										/>
										<XAxis
											dataKey='evaluation'
											tickLine={false}
											axisLine={false}
											tickMargin={8}
										/>
										<YAxis domain={[0, 10]} tickLine={false} axisLine={false} />
										<Tooltip cursor={false} />
										<Legend />
										{DEFAULT_EVALUATION_METRICS.map(metric => (
											<Line
												key={metric.key}
												type='monotone'
												dataKey={metric.key}
												name={metric.label}
												stroke={
													METRIC_LINE_COLORS[metric.key] ??
													'rgba(var(--eds_primary_resting), 1)'
												}
												strokeWidth={3}
												dot={false}
												isAnimationActive={false}
											/>
										))}
									</LineChart>
								</ResponsiveContainer>
							</div>
						</div>
						{evaluations.map(ev => (
							<div
								key={ev.id}
								className='bg-background-default shadow-tile grid w-full
                            grid-cols-2 items-start gap-2 rounded-sm p-4'
							>
								<div className='col-span-2'>
									<div className='font-semibold'>{ev.name}</div>
									<div className='text-text-tertiary text-sm'>
										{new Date(ev.createdAt).toLocaleString()}
									</div>
								</div>
								<div className='outline-background-medium rounded-sm outline-1'>
									<Table className='w-full table-fixed'>
										<Table.Head>
											<Table.Row>
												<Table.Cell className='w-2/3'>Metric</Table.Cell>
												<Table.Cell className='w-1/3'>Score</Table.Cell>
											</Table.Row>
										</Table.Head>
										<Table.Body>
											{DEFAULT_EVALUATION_METRICS.map(m => (
												<Table.Row key={m.key}>
													<Table.Cell>{m.label}</Table.Cell>
													<Table.Cell>
														{ev.metrics[m.key] ?? '-'}
													</Table.Cell>
												</Table.Row>
											))}
										</Table.Body>
									</Table>
								</div>
								<ResponsiveContainer
									width='100%'
									height='100%'
									className='[&_.recharts-polar-angle-axis-tick-value]:fill-text-default
								[&_.recharts-polar-angle-axis-tick-value]:font-medium
    							[&_.recharts-surface]:outline-0!'
								>
									<RadarChart data={toChartData(ev.metrics)}>
										<PolarGrid
											radialLines={false}
											className='stroke-gray-500/50 stroke-2'
										/>
										<PolarAngleAxis dataKey='metric' />
										<Tooltip
											content={({ active, payload }) => {
												if (active && payload && payload.length) {
													return (
														<div className='rounded-sm bg-black p-2 font-medium text-white'>{`${payload[0].value}/10`}</div>
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
						))}
					</>
				) : (
					<p className='text-text-tertiary'>
						No evaluations yet. Use the header button to start one.
					</p>
				)}
			</div>
		</div>
	);
};
