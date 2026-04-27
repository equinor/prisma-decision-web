import { useGetAssessments } from '../../../hooks/api/useGetAssessments';
import { useIsFacilitator } from '../../../hooks/useIsFacilitator';
import { useSelectedProject } from '../../../hooks/useSelectedProject';
import { AssessmentCard } from './AssessmentCard';
import { AssessmentTrend } from './AssessmentTrend';
import { CreateAssessment } from './CreateAssessment';

export const Assessments = () => {
	const { assessments } = useGetAssessments();
	const selectedProject = useSelectedProject();
	const isFacilitator = useIsFacilitator();
	const projectAssessments = assessments.filter(a => a.project_id === selectedProject?.id);

	if (!selectedProject) return;

	return (
		<div className='flex flex-col gap-4'>
			<div className='flex  items-center justify-between'>
				<h1 className='text-3xl font-bold'>{selectedProject.name}</h1>
				{isFacilitator && <CreateAssessment />}
			</div>
			{projectAssessments.length === 0 && (
				<p className='text-text-tertiary text-center text-sm'>
					No assessments yet.{' '}
					{isFacilitator
						? 'Create one to start evaluating.'
						: 'The facilitator will create one.'}
				</p>
			)}
			<div className='grid gap-4 xl:grid-cols-2 [@media(min-width:2000px)]:grid-cols-3'>
				{projectAssessments.map((assessment, index) => (
					<AssessmentCard
						key={assessment.id}
						assessment={assessment}
						prevAssessment={projectAssessments[index + 1]}
					/>
				))}
			</div>
			<AssessmentTrend />
		</div>
	);
};
