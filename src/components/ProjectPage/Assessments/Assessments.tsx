import { useMemo, useRef, useState } from 'react';
import {
	Button,
	CircularProgress,
	Icon,
	Popover,
	Table,
	TextField,
	Tooltip as EdsTooltip,
} from '@equinor/eds-core-react';
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
import { useSelectedProject } from '../../../hooks/useSelectedProject';
import { add, close } from '@equinor/eds-icons';
import { useAssessmentForm } from '../../../hooks/useAssessmentForm';
import { ErrorMessage } from '@hookform/error-message';
import { FormErrorMessage } from '../../common/FormErrorMessage';
import { evaluationMetrics, DecisionQualityAssessment } from '../../../validators';
import { useGetAssessments } from '../../../hooks/api/useGetAssessments';
import { DecisionQualityAssessmentForm } from './DecisionQualityAssessmentForm';
import { useGetSignUser } from '../../../hooks/api/useGetSignUser';

const METRIC_LINE_COLORS: Record<string, string> = {
	value: 'rgba(var(--eds_primary_resting), 1)',
	risk: 'rgba(var(--eds_warning_resting), 1)',
	cost: 'rgba(var(--eds_text_success), 1)',
	feasibility: 'rgba(var(--eds_danger_text), 1)',
	impact: 'rgba(var(--eds_text_secondary), 1)',
};

export const Assessments = () => {
	const { assessments } = useGetAssessments();
	const { signuser } = useGetSignUser();
	const selectedProject = useSelectedProject();
	const {
		register,
		handleSubmit,
		formState: { errors },
		isPending,
	} = useAssessmentForm({
		onSuccess: data => {
			setIsOpen(false);
			setActiveAssessment({ id: data.id, name: data.name });
		},
	});
	const [isOpen, setIsOpen] = useState(false);
	const [activeAssessment, setActiveAssessment] = useState<{
		id: string;
		name: string;
	} | null>(null);

	const referenceElement = useRef<HTMLButtonElement>(null);

	const projectAssessments = useMemo(
		() => (assessments ?? []).filter(a => a.project_id === selectedProject?.id),
		[assessments, selectedProject?.id],
	);

	const assessmentNameById = useMemo(
		() => new Map(projectAssessments.map(a => [a.id, a.name])),
		[projectAssessments],
	);

	const sortedEvaluations = useMemo(
		() =>
			projectAssessments
				.flatMap(a => a.decision_quality_assessments ?? [])
				.sort(
					(a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
				),
		[projectAssessments],
	);

	const toChartData = (metrics: Record<string, number>) =>
		evaluationMetrics.map(m => ({
			metric: m.label,
			score: metrics[m.key],
			fullMark: 10,
		}));

	const metricTrendData = useMemo(
		() =>
			sortedEvaluations.map((ev, i) => {
				const values = evaluationMetrics.reduce<Record<string, number>>((acc, metric) => {
					acc[metric.key] = ev[metric.key as keyof DecisionQualityAssessment] as number;
					return acc;
				}, {});

				return {
					evaluation: ev.created_at
						? new Date(ev.created_at).toLocaleDateString(undefined, {
								month: 'short',
								day: 'numeric',
							})
						: `#${i + 1}`,
					...values,
				};
			}),
		[sortedEvaluations],
	);

	const hasEvaluations = sortedEvaluations.length > 0;
	if (!selectedProject) return;
	const isFacilitator =
		selectedProject.users.find(u => u.user_id === signuser?.user_id)?.role === 'Facilitator';
	return (
		<div className='flex flex-col gap-6'>
			<div className='flex w-full items-center justify-between'>
				<h1 className='text-3xl font-bold'>{selectedProject.name}</h1>
				<EdsTooltip
					title={activeAssessment ? 'Complete or close the active assessment first' : ''}
				>
					<Button
						ref={referenceElement}
						variant='outlined'
						disabled={!!activeAssessment || !isFacilitator}
						onClick={() => setIsOpen(prev => !prev)}
					>
						<Icon data={add} />
						Create Assessment
					</Button>
				</EdsTooltip>
			</div>

			<Popover
				open={isOpen}
				onClose={() => setIsOpen(false)}
				anchorEl={referenceElement.current}
			>
				<Popover.Content className='relative w-[min(520px,90vw)]'>
					<form className='grid w-full grid-cols-1 gap-4' onSubmit={handleSubmit}>
						<div className='w-full pr-16'>
							<h2 className='text-xl font-semibold'>Create Assessment</h2>
							<p className='text-text-tertiary text-sm'>
								Add an assessment to evaluate your project decisions over time.
							</p>
						</div>
						<Button
							variant='ghost_icon'
							className='absolute! top-2 right-2'
							onClick={e => {
								e.stopPropagation();
								setIsOpen(false);
							}}
						>
							<Icon data={close} />
						</Button>
						<div>
							<TextField
								label='Name'
								placeholder='Enter assessment name...'
								{...register('name')}
							/>
							<ErrorMessage as={FormErrorMessage} name='name' errors={errors} />
						</div>
						<div className='flex justify-end'>
							<Button type='submit' disabled={isPending}>
								{isPending ? <CircularProgress size={16} /> : 'Add Assessment'}
							</Button>
						</div>
					</form>
				</Popover.Content>
			</Popover>
			{hasEvaluations && (
				<section className='bg-background-default shadow-tile rounded-md p-5'>
					<h2 className='mb-1 text-lg font-semibold'>Metric Trends</h2>
					<p className='text-text-tertiary mb-4 text-sm'>
						How metrics have changed across evaluations.
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
								data={metricTrendData}
								margin={{ left: 12, right: 12, top: 8, bottom: 8 }}
							>
								<CartesianGrid className='stroke-gray-500/30' vertical={false} />
								<XAxis
									dataKey='evaluation'
									tickLine={false}
									axisLine={false}
									tickMargin={8}
								/>
								<YAxis domain={[0, 10]} tickLine={false} axisLine={false} />
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
			)}

			<div className='grid grid-cols-1 gap-6 2xl:grid-cols-2'>
				{activeAssessment && (
					<section className='bg-background-default shadow-tile rounded-md p-5'>
						<DecisionQualityAssessmentForm
							assessmentId={activeAssessment.id}
							assessmentName={activeAssessment.name}
							isFacilitator={isFacilitator}
							onClose={() => setActiveAssessment(null)}
						/>
					</section>
				)}

				{sortedEvaluations.map(ev => {
					const metrics = evaluationMetrics.reduce<Record<string, number>>((acc, m) => {
						acc[m.key] = (ev[m.key as keyof DecisionQualityAssessment] as number) ?? 0;
						return acc;
					}, {});
					return (
						<section
							key={ev.id}
							className='bg-background-default shadow-tile rounded-md p-5'
						>
							<div className='mb-4'>
								<h3 className='text-lg font-semibold'>
									{assessmentNameById.get(ev.assessment_id) ??
										'Unnamed Assessment'}
								</h3>
								{ev.created_at && (
									<p className='text-text-tertiary text-sm'>
										{new Date(ev.created_at).toLocaleDateString(undefined, {
											year: 'numeric',
											month: 'short',
											day: 'numeric',
										})}{' '}
										&middot;{' '}
										{new Date(ev.created_at).toLocaleTimeString(undefined, {
											hour: '2-digit',
											minute: '2-digit',
										})}
									</p>
								)}
							</div>
							<div className='grid grid-cols-2 items-start gap-4'>
								<div className='outline-background-medium rounded-sm outline-1'>
									<Table className='w-full table-fixed'>
										<Table.Head>
											<Table.Row>
												<Table.Cell className='w-2/3'>Metric</Table.Cell>
												<Table.Cell className='w-1/3'>Score</Table.Cell>
											</Table.Row>
										</Table.Head>
										<Table.Body>
											{evaluationMetrics.map(m => (
												<Table.Row key={m.key}>
													<Table.Cell>{m.label}</Table.Cell>
													<Table.Cell>
														<span className='font-medium'>
															{metrics[m.key] ?? '-'}
														</span>
														<span className='text-text-tertiary text-xs'>
															{' '}
															/ 10
														</span>
													</Table.Cell>
												</Table.Row>
											))}
										</Table.Body>
									</Table>
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
										<RadarChart data={toChartData(metrics)}>
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
						</section>
					);
				})}
			</div>

			{/* Empty state */}
			{!hasEvaluations && (
				<p className='text-text-tertiary text-center text-sm'>
					No evaluations yet. Use the form above to submit your first evaluation.
				</p>
			)}
		</div>
	);
};
