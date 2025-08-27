import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Project } from '../../validators';
import { useNavigate } from 'react-router';

export const useCreateProject = () => {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	return useMutation({
		mutationFn: async (project: Project) => {
			const res = await apiClient.post<Project[]>('/projects', [project]);
			return res.data[0];
		},
		onSuccess: async data => {
			await queryClient.refetchQueries({ queryKey: ['projects'] });
			const mainScenario = data.scenarios.find(scenario => scenario.name === 'main');
			navigate(`/project/${data.id}/${mainScenario?.id}`);
		},
	});
};
