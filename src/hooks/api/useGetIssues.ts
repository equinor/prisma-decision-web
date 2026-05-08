import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Issue } from '../../validators';
import { showErrorToast } from '../../components/ShowToast';

const defaultValue: Issue[] = [];

export const useGetIssues = () => {
	const { data = defaultValue, ...rest } = useQuery({
		queryKey: ['issues'],
		queryFn: async () => {
			try {
				const res = await apiClient.get<Issue[]>('/issues');
				return res.data;
			} catch {
				showErrorToast('Failed to fetch issues');
			}
		},
	});

	return {
		issues: data,
		...rest,
	};
};
