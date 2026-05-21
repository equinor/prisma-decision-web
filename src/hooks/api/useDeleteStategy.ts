import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Project, Strategy } from '../../validators';
import { showErrorToast } from '../../components/ShowToast';

export const useDeleteStrategy = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (strategy: Strategy) => {
			await apiClient.delete(`/strategies/${strategy.id}`);
			return strategy;
		},
		onMutate: async (strategy: Strategy) => {
			await queryClient.cancelQueries({ queryKey: ['projects'] });
			const previousProjects = queryClient.getQueryData<Project[]>(['projects']) || [];
			const updatedProjects = previousProjects.map(project => {
				return {
					...project,
					strategies: project.strategies.filter((s: Strategy) => s.id !== strategy.id),
				};
			});
			queryClient.setQueryData(['projects'], updatedProjects);
			return { previousProjects };
		},
		onError: (_err, _strategy, context) => {
			showErrorToast('Failed to delete strategy');
			if (context?.previousProjects) {
				queryClient.setQueryData(['projects'], context.previousProjects);
			}
		},
		onSuccess: async () => {
			await queryClient.refetchQueries({ queryKey: ['projects'] });
		},
	});
};
