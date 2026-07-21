import { Button, Icon, Tooltip } from '@equinor/eds-core-react';
import { check_circle_outlined, mood_happy, mood_neutral, mood_very_sad } from '@equinor/eds-icons';
import { useGetSignUser } from '../../../hooks/api/useGetSignUser';
import { useUpdateAssessment } from '../../../hooks/api/useUpdateAssessment';
import { useIsFacilitator } from '../../../hooks/useIsFacilitator';
import { cn } from '../../../utils/cn';
import {
	getAssessmentVariance,
	getAveragedMetrics,
	getMetricDifferences,
} from '../../../utils/getAveragedMetrics';
import { Assessment, evaluationMetrics } from '../../../validators';
import { DecisionQualityAssessmentForm } from './DecisionQualityAssessmentForm';
import { formatDate } from 'date-fns';
import { useSelectedProject } from '../ProjectContext';

export const AssessmentCard = ({
	assessment,
	prevAssessment,
}: {
	assessment: Assessment;
	prevAssessment?: Assessment;
}) => {
	const selectedProject = useSelectedProject();
	const { signuser } = useGetSignUser();
	const submissions = assessment.decision_quality_assessments ?? [];
	const isCompleted = assessment.is_completed;
	const isFacilitator = useIsFacilitator();
	const responseCount = submissions.length;
	const totalUsers = selectedProject?.users.length ?? 0;
	const hasSubmitted = !!submissions.find(s => s.created_by_id === signuser?.user_id);
	const averagedMetrics = getAveragedMetrics(submissions);
	const prevAveragedMetrics = prevAssessment?.decision_quality_assessments
		? getAveragedMetrics(prevAssessment.decision_quality_assessments)
		: null;

	const variance = getAssessmentVariance(submissions);
	const changes = getMetricDifferences(averagedMetrics, prevAveragedMetrics);

	const { mutate: updateAssessment } = useUpdateAssessment();

	const handleMarkComplete = () => {
		updateAssessment({ ...assessment, is_completed: true });
	};

	const showForm = !hasSubmitted && !isCompleted;
	if (showForm) return <DecisionQualityAssessmentForm assessment={assessment} />;
	return (
		<section className='bg-background-default shadow-tile flex flex-col gap-4 rounded-md p-5'>
			<div className='flex items-start justify-between'>
				<div>
					<h3 className='text-lg font-semibold'>
						{assessment.name}
						{isCompleted && (
							<span className='ml-2 inline-block rounded-full bg-green-100 px-2 py-0.5 align-middle text-xs font-medium text-green-800'>
								Completed
							</span>
						)}
						{hasSubmitted && !isCompleted && (
							<span className='ml-2 inline-block rounded-full bg-yellow-100 px-2 py-0.5 align-middle text-xs font-medium text-yellow-800'>
								Submitted
							</span>
						)}
					</h3>
					<p className='text-text-tertiary text-sm'>
						{isCompleted
							? `Assessment completed • ${responseCount} responses`
							: `${responseCount} of ${totalUsers} users responded`}
					</p>
					<p className='text-text-tertiary text-sm'>
						{formatDate(new Date(assessment.created_at), 'PPP p')}
					</p>
				</div>
				{isFacilitator && responseCount > 0 && !isCompleted && (
					<Button variant='outlined' color='primary' onClick={handleMarkComplete}>
						{isCompleted ? (
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
			<div className='grid grid-cols-2 gap-4'>
				{evaluationMetrics.map(metric => {
					return (
						<div key={metric.key} className='flex flex-col gap-1'>
							<div className='flex items-center gap-2'>
								<h3 className='text-text-tertiary text-xs font-semibold tracking-tight uppercase'>
									{metric.label}
								</h3>
							</div>
							<div className='flex items-center  gap-2'>
								<div>
									<p className='text-2xl font-medium'>
										{averagedMetrics?.[metric.key]} /{' '}
										<span className='text-text-tertiary text-lg'>100</span>
										{changes && prevAveragedMetrics && (
											<span
												className={cn('ml-2 text-sm font-semibold', {
													'text-green-600': changes[metric.key] > 0,
													'text-red-600': changes[metric.key] < 0,
												})}
											>
												{changes[metric.key] >= 0 && '+'}
												{changes[metric.key]}
											</span>
										)}
									</p>
								</div>
								{variance && (
									<Tooltip title={`${variance[metric.key]} variance`}>
										<Icon
											className={cn('size-5 rounded-full', {
												'fill-green-500': variance[metric.key] === 'low',
												'fill-yellow-500':
													variance[metric.key] === 'medium',
												'fill-red-500': variance[metric.key] === 'high',
											})}
											data={
												{
													low: mood_happy,
													medium: mood_neutral,
													high: mood_very_sad,
												}[variance[metric.key]]
											}
										/>
									</Tooltip>
								)}
							</div>
						</div>
					);
				})}
			</div>
			<AssessemntComments assessment={assessment} />
		</section>
	);
};

const AssessemntComments = ({ assessment }: { assessment: Assessment }) => {
	const selectedProject = useSelectedProject();

	return (
		<div className='flex flex-col gap-2'>
			<h3 className='text-xl font-semibold'>Comments</h3>
			{assessment.decision_quality_assessments?.map(dqa => (
				<div key={dqa.id} className='flex flex-col'>
					{dqa.comment && (
						<>
							<h5 className='font-medium'>
								{
									selectedProject.users.find(
										user => user.user_id === dqa.created_by_id,
									)?.name
								}
							</h5>
							<p className='text-sm'>{dqa.comment || 'No comment provided'}</p>
						</>
					)}
				</div>
			))}
			{assessment.decision_quality_assessments?.filter(x => !!x.comment).length === 0 && (
				<p className='text-sm'>No comment provided</p>
			)}
		</div>
	);
};
