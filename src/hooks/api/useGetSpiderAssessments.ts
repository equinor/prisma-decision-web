import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { SpiderAssessment } from '../../validators';

export const useGetSpiderAssessments = () => {
	const { data } = useQuery({
		queryKey: ['assessments', 'spider'],
		queryFn: async () => {
			const res = await apiClient.get<SpiderAssessment[]>('/spider-assessments');
			return res.data;
		},
	});

	return {
		spiderAssessments: data || [],
	};
};
