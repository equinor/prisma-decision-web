import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { DecisionQualityAssessment } from '../../validators';

export const useGetDecisionQualityAssessments = () => {
	const { data } = useQuery({
		queryKey: ['assessments', 'DecisionQuality'],
		queryFn: async () => {
			const res = await apiClient.get<DecisionQualityAssessment[]>(
				'/DecisionQualityassessments',
			);
			return res.data;
		},
	});

	return {
		DecisionQualityAssessments: data || [],
	};
};
