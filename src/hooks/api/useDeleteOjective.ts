import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Objective, Project } from '../../validators';

export const useDeleteObjective = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (objective: Objective) => {
			await apiClient.delete(`/objectives/${objective.id}`);
			return objective;
		},
		onMutate: (deletedObjective: Objective) => {
			queryClient.cancelQueries({ queryKey: ['projects'] });
			const scenarioId = deletedObjective.scenario_id;
			const previousProjects = queryClient.getQueryData<Project[]>(['projects']) || [];
			const newProjects = previousProjects.map(project => {
				return {
					...project,
					scenarios: project.scenarios.map(scenario => {
						if (scenario.id === scenarioId) {
							return {
								...scenario,
								objectives: scenario.objectives.filter(
									objective => objective.id !== deletedObjective.id,
								),
							};
						}
						return scenario;
					}),
				};
			});
			queryClient.setQueryData(['projects'], newProjects);
			return { previousProjects };
		},
		onError: (_err, _deletedObjective, context) => {
			if (context?.previousProjects) {
				queryClient.setQueryData(['projects'], context.previousProjects);
			}
		},
	});
};
