import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { useHasInfluenceDiagramError } from '../useHasInfluenceDiagramError';
import { SolutionEvidenceRequest, SolutionEvidenceResponse } from '../../validators';

export const useGetExpectedValue = (
	evidence: SolutionEvidenceRequest[],
	projectId: string,
	allowEmptyStateIds?: boolean,
) => {
	const { hasError: hasValidationError } = useHasInfluenceDiagramError();
	const hasEvidence = evidence.some(item => item.state_ids.length > 0);
	const runBaseEvidence = allowEmptyStateIds && evidence.length > 0;
	const { data, ...rest } = useQuery({
		queryKey: ['solution', projectId, evidence],
		placeholderData: keepPreviousData,
		queryFn: async () => {
			const res = await apiClient.post<SolutionEvidenceResponse[]>(
				`/solvers/project/${projectId}/with_evidence`,
				evidence,
			);
			return res.data;
		},
		retry: false,
		enabled: !!projectId && (hasEvidence || runBaseEvidence) && !hasValidationError,
		meta: {
			errorMessage: 'Failed to fetch solutions with evidence',
		},
	});
	return { data, ...rest };
};
