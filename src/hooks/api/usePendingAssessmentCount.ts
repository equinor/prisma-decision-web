import { useSelectedProject } from '../useSelectedProject';
import { useGetAssessments } from './useGetAssessments';
import { useGetSignUser } from './useGetSignUser';

export const usePendingAssessmentCount = () => {
	const { assessments } = useGetAssessments();
	const { signuser } = useGetSignUser();
	const selectedProject = useSelectedProject();

	if (!assessments || !signuser || !selectedProject) return 0;
	const projectAssessments = assessments.filter(a => a.project_id === selectedProject.id);
	return projectAssessments.filter(a => {
		if (a.is_completed) return false;
		const submissions = a.decision_quality_assessments ?? [];
		return !submissions.some(s => s.created_by_id === signuser.user_id);
	}).length;
};
