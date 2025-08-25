import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Project } from '../../validators';
import { useNavigate } from 'react-router';

export const useCreateProject = () => {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	return useMutation({
		mutationFn: async (project: Project) => {
			console.log(project);

			// const res = await apiClient.post<Project[]>('/projects', [project]);
			// return res.data[0];
		},
		onSuccess: data => {
			queryClient.refetchQueries({ queryKey: ['projects'] });
			navigate(`/project/${data.id}`);
		},
	});
};
