import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { getChatStrategyPayload, type ChatItemToSave } from '../../utils/chatInterview';
import type { Issue } from '../../validators';
import { saveChatDiagram } from './useChatDiagram';

const collections = { objective: 'objectives', issue: 'issues', strategy: 'strategies' } as const;

export const useSaveChatItem = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (draft: ChatItemToSave) => {
			if (draft.kind === 'influence_diagram') return saveChatDiagram(draft);
			const item =
				draft.kind === 'strategy'
					? getChatStrategyPayload(draft, (await apiClient.get<Issue[]>('/issues')).data)
					: draft.item;
			const collection = collections[draft.kind];
			if (draft.update) await apiClient.put(`/${collection}`, [item]);
			else await apiClient.post(`/${collection}`, [item]);
			// Awaited so the chat reads the saved item from the cache when it continues.
			await queryClient.invalidateQueries({ queryKey: [collection] });
		},
		onSettled: () =>
			Promise.all(
				[
					'edges',
					'nodes',
					'probabilityTables',
					'utilityTables',
					'decisionTree',
					'solution',
				].map(key => queryClient.invalidateQueries({ queryKey: [key] })),
			),
	});
};
