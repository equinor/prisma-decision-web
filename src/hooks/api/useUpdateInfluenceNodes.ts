import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { InfluenceNode } from '../../validators';

export const useUpdateInfluenceNodesOptimistic = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (nodes: InfluenceNode[]) => {
			await apiClient.put('/nodes', nodes);
		},
		onMutate: nodes => {
			queryClient.cancelQueries({ queryKey: ['nodes'] });
			const previousNodes = queryClient.getQueryData<InfluenceNode[]>(['nodes']);
			const newNodes = previousNodes?.map(node => {
				const updatedNodes = nodes.find(i => {
					return i.id === node.id;
				});
				return updatedNodes
					? {
							...updatedNodes,
							node_style: {
								...updatedNodes.node_style,
							},
						}
					: node;
			});
			queryClient.setQueryData(['nodes'], newNodes);
			return { previousNodes };
		},
		onError: (_err, _nodes, context) => {
			queryClient.setQueryData(['nodes'], context?.previousNodes);
		},
	});
};
