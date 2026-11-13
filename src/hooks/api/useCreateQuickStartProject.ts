import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { apiClient } from '../../api';
import { getChatStrategyPayload } from '../../utils/chatInterview';
import type { QuickStartRecords } from '../../utils/quickStart';
import type { Issue } from '../../validators';
import { saveChatDiagram } from './useChatDiagram';

// Each step only posts what is missing, so a failed creation can be retried safely.
const createMissing = async (
	collection: string,
	saved: { id: string }[],
	items: { id: string }[],
) => {
	const savedIds = new Set(saved.map(item => item.id));
	const missing = items.filter(item => !savedIds.has(item.id));
	if (missing.length) await apiClient.post(`/${collection}`, missing);
};

export const useCreateQuickStartProject = () => {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	return useMutation({
		mutationFn: async ({
			project,
			objectives,
			issues,
			strategies,
			diagram,
		}: QuickStartRecords) => {
			const list = async (url: string) => (await apiClient.get<{ id: string }[]>(url)).data;
			// The API does not implement GET /projects/{id}/issues, so filter all issues instead.
			const getSavedIssues = async () =>
				(await apiClient.get<Issue[]>('/issues')).data.filter(
					issue => issue.project_id === project.id,
				);
			await createMissing('projects', await list('/projects'), [project]);
			await createMissing(
				'objectives',
				await list(`/projects/${project.id}/objectives`),
				objectives,
			);
			await createMissing('issues', await getSavedIssues(), issues);
			const savedIssues = await getSavedIssues();
			await createMissing(
				'strategies',
				await list(`/projects/${project.id}/strategies`),
				strategies.map(draft => getChatStrategyPayload(draft, savedIssues)),
			);
			// Saves connections first, then the probability and utility tables Prisma creates for them.
			if (diagram.edges.length)
				await saveChatDiagram({
					kind: 'influence_diagram',
					path: 'influence_diagram',
					project_id: project.id,
					item: diagram,
					original: { edges: [], discrete_probabilities: [], discrete_utilities: [] },
				});
			return project;
		},
		onSuccess: async project => {
			await Promise.all(
				[
					'projects',
					'objectives',
					'issues',
					'strategies',
					'edges',
					'nodes',
					'probabilityTables',
					'utilityTables',
				].map(queryKey => queryClient.invalidateQueries({ queryKey: [queryKey] })),
			);
			navigate(`/project/${project.id}`);
		},
	});
};
