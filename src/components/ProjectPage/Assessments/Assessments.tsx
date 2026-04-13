import { useMemo, useRef, useState } from 'react';
import { Button, CircularProgress, Icon, Popover, Table, TextField } from '@equinor/eds-core-react';
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
import { add, check_circle_outlined, close } from '@equinor/eds-icons';
import { useAssessmentForm } from '../../../hooks/useAssessmentForm';
import { ErrorMessage } from '@hookform/error-message';
import { FormErrorMessage } from '../../common/FormErrorMessage';
import {
	evaluationMetrics,
	DecisionQualityAssessment,
	Assessment,
	ProjectRole,
} from '../../../validators';
import { useGetAssessments } from '../../../hooks/api/useGetAssessments';
import { DecisionQualityAssessmentForm } from './DecisionQualityAssessmentForm';
import { useGetSignUser } from '../../../hooks/api/useGetSignUser';
import { getAveragedMetrics } from '../../../utils/getAveragedMetrics';
import { useUpdateAssessment } from '../../../hooks/api/useUpdateAssessment';

const METRIC_LINE_COLORS: Record<string, string> = {
	appropriate_frame: 'rgba(var(--eds_primary_resting), 1)',
	trade_off_analysis: 'rgba(var(--eds_warning_resting), 1)',
	reasoning_correctness: 'rgba(var(--eds_text_success), 1)',
	information_reliability: 'rgba(var(--eds_danger_text), 1)',
	doable_alternatives: 'rgba(var(--eds_text_secondary), 1)',
	commitment_to_action: '#6366f1',
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
		onSuccess: () => {
			setIsOpen(false);
		},
	});
	const [isOpen, setIsOpen] = useState(false);

	const referenceElement = useRef<HTMLButtonElement>(null);

	const projectAssessments = useMemo(
		() => (assessments ?? []).filter(a => a.project_id === selectedProject?.id),
		[assessments, selectedProject?.id],
	);

	const toChartData = (metrics: Record<string, number>) =>
		evaluationMetrics.map(m => ({
			metric: m.label,
			score: metrics[m.key],
			fullMark: 10,
		}));

	const totalUsers = selectedProject?.users.length ?? 0;
	const isFacilitator =
		selectedProject?.users.find(u => u.user_id === signuser?.user_id)?.role === 'Facilitator';

	const completedAssessmentTrends = useMemo(() => {
		return projectAssessments
			.filter(a => (a.decision_quality_assessments ?? []).length >= totalUsers)
			.map(a => {
				const avg = getAveragedMetrics(a.decision_quality_assessments ?? []);
				return avg ? { name: a.name, ...avg } : null;
			})
			.filter(Boolean) as (Record<string, number> & { name: string })[];
	}, [projectAssessments, totalUsers]);

	if (!selectedProject) return;

	return (
		<div className='flex flex-col gap-6'>
			<div className='flex w-full items-center justify-between'>
				<h1 className='text-3xl font-bold'>{selectedProject.name}</h1>
				{isFacilitator && (
					<Button
						ref={referenceElement}
						variant='outlined'
						onClick={() => setIsOpen(prev => !prev)}
					>
						<Icon data={add} />
						Create Assessment
					</Button>
				)}
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

			{completedAssessmentTrends.length > 1 && (
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
								<XAxis
									dataKey='name'
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

			{projectAssessments.length === 0 && (
				<p className='text-text-tertiary text-center text-sm'>
					No assessments yet.{' '}
					{isFacilitator
						? 'Create one to start evaluating.'
						: 'The facilitator will create one.'}
				</p>
			)}

			<div className='flex flex-col gap-6'>
				{projectAssessments.map(assessment => (
					<AssessmentCard
						key={assessment.id}
						assessment={assessment}
						currentUserId={signuser?.user_id ?? ''}
						isFacilitator={!!isFacilitator}
						totalUsers={totalUsers}
						projectUsers={selectedProject.users}
						toChartData={toChartData}
					/>
				))}
			</div>
		</div>
	);
};

const AssessmentCard = ({
	assessment,
	currentUserId,
	isFacilitator,
	totalUsers,
	toChartData,
}: {
	assessment: Assessment;
	currentUserId: string;
	isFacilitator: boolean;
	totalUsers: number;
	projectUsers: ProjectRole[];
	toChartData: (
		metrics: Record<string, number>,
	) => { metric: string; score: number; fullMark: number }[];
}) => {
	const submissions = assessment.decision_quality_assessments ?? [];
	const isCompleted = assessment.is_completed;
	const responseCount = submissions.length;
	const allResponded = isCompleted || responseCount >= totalUsers;
	const userSubmission = submissions.find(s => s.created_by_id === currentUserId);
	const [justSubmitted, setJustSubmitted] = useState(false);
	const hasSubmitted = isCompleted || !!userSubmission || justSubmitted;
	const canSubmit = !isCompleted;
	const averagedMetrics = submissions.length > 0 ? getAveragedMetrics(submissions) : null;

	const { mutate: updateAssessment, isPending: isCompleting } = useUpdateAssessment();

	const handleMarkComplete = () => {
		updateAssessment({ ...assessment, is_completed: true });
	};

	const [showIndividual, setShowIndividual] = useState(false);

	const showForm = !hasSubmitted && !allResponded && canSubmit;

	return (
		<section
			className={`bg-background-default shadow-tile rounded-md p-5 ${showForm ? 'ring-primary-resting ring-2' : ''}`}
		>
			{' '}
			<div className='mb-4 flex items-start justify-between'>
				<div>
					<h3 className='text-lg font-semibold'>
						{assessment.name}
						{isCompleted && (
							<span className='ml-2 inline-block rounded-full bg-green-100 px-2 py-0.5 align-middle text-xs font-medium text-green-800'>
								Completed
							</span>
						)}
					</h3>
					<p className='text-text-tertiary text-sm'>
						{isCompleted
							? `Assessment completed • ${responseCount} responses`
							: `${responseCount} of ${totalUsers} users responded`}
					</p>
				</div>
				{isFacilitator && responseCount > 0 && (
					<Button
						variant='outlined'
						color='primary'
						disabled={isCompleting}
						onClick={handleMarkComplete}
					>
						{isCompleting ? (
							<CircularProgress size={16} />
						) : isCompleted ? (
							<>
								<Icon data={check_circle_outlined} />
								Completed
							</>
						) : (
							'Mark as Complete'
						)}
					</Button>
				)}
			</div>
			{/* Form: show if not yet submitted and user can submit */}
			{showForm && (
				<DecisionQualityAssessmentForm
					assessmentId={assessment.id}
					assessmentName={assessment.name}
					onSubmitted={() => setJustSubmitted(true)}
				/>
			)}
			{/* Waiting message */}
			{!allResponded && (hasSubmitted || !canSubmit) && (
				<div className='bg-background-light rounded-md p-4'>
					<p className='text-text-tertiary text-sm'>
						You submitted your evaluation. Waiting for all users to respond before
						results are visible.
					</p>
				</div>
			)}
			{/* Averaged results: only when all users responded */}
			{allResponded && averagedMetrics && (
				<div className='mt-4'>
					<h4 className='mb-2 text-base font-semibold'>Averaged Results</h4>
					<div className='grid grid-cols-2 items-start gap-4'>
						<div className='outline-background-medium rounded-sm outline-1'>
							<Table className='w-full table-fixed'>
								<Table.Head>
									<Table.Row>
										<Table.Cell className='w-2/3'>Metric</Table.Cell>
										<Table.Cell className='w-1/3'>Avg Score</Table.Cell>
									</Table.Row>
								</Table.Head>
								<Table.Body>
									{evaluationMetrics.map(m => (
										<Table.Row key={m.key}>
											<Table.Cell>{m.label}</Table.Cell>
											<Table.Cell>
												<span className='font-medium'>
													{averagedMetrics[m.key] ?? '-'}
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
								<RadarChart data={toChartData(averagedMetrics)}>
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
				</div>
			)}
			{/* Individual responses: facilitator only, after all responded */}
			{isFacilitator && (
				<div className='mt-4'>
					<button
						type='button'
						className='text-primary-resting mb-2 text-sm font-medium underline'
						onClick={() => setShowIndividual(prev => !prev)}
					>
						{showIndividual
							? 'Hide individual responses'
							: `Show individual responses (${submissions.length})`}
					</button>
					{showIndividual && (
						<div className='outline-background-medium overflow-x-auto rounded-sm outline-1'>
							<Table className='w-full'>
								<Table.Head>
									<Table.Row>
										<Table.Cell>Metric</Table.Cell>
										{submissions.map(sub => (
											<Table.Cell key={sub.id}>{'user'}</Table.Cell>
										))}
									</Table.Row>
								</Table.Head>
								<Table.Body>
									{evaluationMetrics.map(m => (
										<Table.Row key={m.key}>
											<Table.Cell>{m.label}</Table.Cell>
											{submissions.map(sub => (
												<Table.Cell key={sub.id}>
													<span className='font-medium'>
														{(sub[
															m.key as keyof DecisionQualityAssessment
														] as number) ?? '-'}
													</span>
													<span className='text-text-tertiary text-xs'>
														{' '}
														/ 10
													</span>
												</Table.Cell>
											))}
										</Table.Row>
									))}
									{submissions.some(s => s.comment) && (
										<Table.Row>
											<Table.Cell className='italic'>Comment</Table.Cell>
											{submissions.map(sub => (
												<Table.Cell
													key={sub.id}
													className='text-text-tertiary text-xs italic'
												>
													{sub.comment || '-'}
												</Table.Cell>
											))}
										</Table.Row>
									)}
								</Table.Body>
							</Table>
						</div>
					)}
				</div>
			)}
		</section>
	);
};
