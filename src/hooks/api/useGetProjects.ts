import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Project } from '../../validators';

export const useGetProjects = () => {
	const { data = [] } = useQuery({
		queryKey: ['projects'],
		queryFn: async () => {
			const res = await apiClient.get<Project[]>('/projects');
			return res.data;
		},
	});

	return data;
};
