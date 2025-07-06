import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Issue } from '../../validators';

export const useGetIssues = () => {
	const { data = [], ...rest } = useQuery({
		queryKey: ['issues'],
		queryFn: async () => {
			const res = await apiClient.get<Issue[]>('/issues');
			return res.data;
		},
	});

	return {
		issues: data,
		...rest,
	};
};
