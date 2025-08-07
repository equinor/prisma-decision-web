import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Opportunity, Project } from '../../validators';

export const useDeleteOpportunityStatment = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (opportunity: Opportunity) => {
			await apiClient.delete(`/opportunities/${opportunity.id}`);
			return opportunity;
		},
		onMutate: (deletedOpportunity: Opportunity) => {
			queryClient.cancelQueries({ queryKey: ['projects'] });
			const scenarioId = deletedOpportunity.scenario_id;
			const previousProjects = queryClient.getQueryData<Project[]>(['projects']) || [];
			const newProjects = previousProjects.map(project => {
				return {
					...project,
					scenarios: project.scenarios.map(scenario => {
						if (scenario.id === scenarioId) {
							return {
								...scenario,
								opportunities: scenario.opportunities.filter(
									opportunity => opportunity.id !== deletedOpportunity.id,
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
		onError: (_err, _deletedOpportunity, context) => {
			if (context?.previousProjects) {
				queryClient.setQueryData(['projects'], context.previousProjects);
			}
		},
	});
};
