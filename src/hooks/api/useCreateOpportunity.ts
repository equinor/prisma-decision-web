import { useQueryClient, useMutation } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Opportunity, Project } from '../../validators';

export const useCreateOpportunity = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: Opportunity) => {
			const res = await apiClient.post('/opportunities', [data]);
			return res.data[0];
		},
		onSuccess: () => {
			queryClient.refetchQueries({ queryKey: ['projects'] });
		},
	});
};

export const useCreateOpportunityOptimistic = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: Opportunity) => {
			const res = await apiClient.post('/opportunities', [data]);
			return res.data[0];
		},
		onMutate: (newOpportunity: Opportunity) => {
			queryClient.cancelQueries({ queryKey: ['projects'] });
			const scenarioId = newOpportunity.scenario_id;
			const previousProjects = queryClient.getQueryData<Project[]>(['projects']) || [];
			const newProjects = previousProjects.map(project => {
				return {
					...project,
					scenarios: project.scenarios.map(scenario => {
						if (scenario.id === scenarioId) {
							return {
								...scenario,
								opportunities: [...scenario.opportunities, newOpportunity],
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
		},
	});
};
