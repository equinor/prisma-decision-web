import { useGetInfluenceDiagramErrors } from './api/useGetInfluenceDiagramErrors';
import { useSelectedProject } from './useSelectedProject';
import { useSelectedProjectIssues } from './useSelectedProjectIssues';
import { ValidateProbabilityTable } from '../components/ProjectPage/InfluenceDiagram/InfluenceDiagramValidation';

export const useHasInfluenceDiagramError = () => {
	const selectedProject = useSelectedProject();
	const issues = useSelectedProjectIssues();
	const { data: errors } = useGetInfluenceDiagramErrors(selectedProject?.id);
	return !!errors?.message || ValidateProbabilityTable(issues);
};
