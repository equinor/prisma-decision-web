import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Issue } from '../../validators';

const defaultValue: Issue[] = [];

export const useGetIssues = () => {
	const { data = defaultValue, ...rest } = useQuery({
		queryKey: ['issues'],
		queryFn: async () => {
			const res = await apiClient.get<Issue[]>('/issues');
			return res.data;
		},
		meta: {
			errorMessage: 'Failed to fetch issues',
		},
	});

	return {
		issues: data,
		...rest,
	};
};
