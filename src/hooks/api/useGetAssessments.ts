import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Assessment } from '../../validators';

export const useGetAssessments = () => {
	const { data } = useQuery({
		queryKey: ['assessments'],
		queryFn: async () => {
			const res = await apiClient.get<Assessment[]>('/assessments');
			return res.data;
		},
	});

	return {
		assessments: data || [],
	};
};
