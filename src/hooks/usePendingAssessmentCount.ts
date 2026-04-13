import { useMemo } from 'react';
import { useGetAssessments } from './api/useGetAssessments';
import { useGetSignUser } from './api/useGetSignUser';
import { useSelectedProject } from './useSelectedProject';

export const usePendingAssessmentCount = () => {
	const { assessments } = useGetAssessments();
	const { signuser } = useGetSignUser();
	const selectedProject = useSelectedProject();

	return useMemo(() => {
		if (!assessments || !signuser || !selectedProject) return 0;
		const projectAssessments = assessments.filter(a => a.project_id === selectedProject.id);
		return projectAssessments.filter(a => {
			// Completed assessments don't need notifications
			if (a.is_completed) return false;
			const submissions = a.decision_quality_assessments ?? [];
			return !submissions.some(s => s.created_by_id === signuser.user_id);
		}).length;
	}, [assessments, signuser, selectedProject]);
};
