import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { useHasInfluenceDiagramError } from '../useHasInfluenceDiagramError';
import { SolutionEvidenceRequest, SolutionEvidenceResponse } from '../../validators';

export const useGetSolutionsWithEvidence = (projectId?: string, evidence?: SolutionEvidenceRequest[]) => {
	const { hasError: hasValidationError } = useHasInfluenceDiagramError();
	const { data, ...rest } = useQuery({
		queryKey: ['solution', projectId, evidence],
		placeholderData: keepPreviousData,
		queryFn: async () => {
			const res = await apiClient.post<SolutionEvidenceResponse[]>(
				`/solvers/project/${projectId}/with_evidence`,
				evidence
			);
			return res.data;
		},
		retry: false,
		enabled: !!projectId && !hasValidationError,
		meta: {
			errorMessage: 'Failed to fetch solutions with evidence',
		},
	});
	return { data, ...rest };
};
