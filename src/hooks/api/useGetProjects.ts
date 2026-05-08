import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Project } from '../../validators';
import { showErrorToast } from '../../components/ShowToast';
export const useGetProjects = () => {
	const { data = [], ...rest } = useQuery({
		queryKey: ['projects'],
		queryFn: async () => {
			try {
				const res = await apiClient.get<Project[]>('/projects');
				return res.data;
			} catch {
				showErrorToast('Failed to fetch projects. Please try again later.');
			}
		},
	});

	return {
		projects: data,
		...rest,
	};
};
