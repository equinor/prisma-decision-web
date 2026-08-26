import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { PolicyTableDecision } from '../../validators';
import { useHasInfluenceDiagramError } from '../useHasInfluenceDiagramError';
import { useSelectedProject } from '../../components/ProjectPage/ProjectContext';

export const useGetPolicyTable = () => {
	const selectedProject = useSelectedProject();
	const projectId = selectedProject.id;
	const { hasError: hasValidationError } = useHasInfluenceDiagramError();
	const { data = [], ...rest } = useQuery({
		queryKey: ['policyTable'],
		queryFn: async () => {
			const res = await apiClient.post<PolicyTableDecision[]>(
				`solvers/project/${projectId}/policy_table`,
			);
			return res.data;
		},
		enabled: !!projectId && !hasValidationError,
		meta: {
			errorMessage: 'Failed to fetch policy table',
		},
	});

	return {
		policyTable: data,
		...rest,
	};
};
