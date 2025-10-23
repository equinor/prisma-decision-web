import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Objective, Project } from '../../validators';

export const useCreateObjective = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: Objective) => {
			const res = await apiClient.post('/objectives', [data]);
			return res.data[0];
		},
		onSuccess: () => {
			queryClient.refetchQueries({ queryKey: ['projects'] });
		},
	});
};

export const useCreateObjectiveOptimistic = ({ onSuccess }: { onSuccess?: () => void }) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: Objective) => {
			const res = await apiClient.post('/objectives', [data]);
			return res.data[0];
		},
		onMutate: (newObjective: Objective) => {
			queryClient.cancelQueries({ queryKey: ['projects'] });
			const scenarioId = newObjective.scenario_id;
			const previousProjects = queryClient.getQueryData<Project[]>(['projects']) || [];
			const newProjects = previousProjects.map(project => {
				return {
					...project,
					scenarios: project.scenarios.map(scenario => {
						if (scenario.id === scenarioId) {
							return {
								...scenario,
								objectives: [...scenario.objectives, newObjective],
							};
						}
						return scenario;
					}),
				};
			});
			queryClient.setQueryData(['projects'], [...newProjects]);
			return { previousProjects };
		},
		onError: (_err, _newOpportunity, context) => {
			if (context?.previousProjects) {
				queryClient.setQueryData(['projects'], context.previousProjects);
			}
			return _err;
		},
		onSuccess: async () => {
			await queryClient.refetchQueries({ queryKey: ['projects'] });
			await queryClient.refetchQueries({ queryKey: ['objectives'] });
			onSuccess?.();
		},
	});
};
