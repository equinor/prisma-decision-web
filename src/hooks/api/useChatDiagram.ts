import axios from 'axios';
import { z } from 'zod';
import { apiClient } from '../../api';
import { issueSchema } from '../../validators';
import type { ChatItemToSave } from '../../utils/chatInterview';

const records = z.array(z.object({ project_id: z.guid() }).catchall(z.unknown()));
export const loadChatDiagram = async (projectId: string) => {
	const [edges, probabilities, utilities, issues] = await Promise.all([
		apiClient.get<unknown>('/edges'),
		apiClient.get<unknown>('/discrete_probabilities'),
		apiClient.get<unknown>('/discrete_utilities'),
		apiClient.get<unknown>('/issues'),
	]);
	const projectIssues = records.parse(issues.data).filter(r => r.project_id === projectId);
	const parsedIssues = z.array(issueSchema).safeParse(projectIssues);
	if (!parsedIssues.success) {
		const problem = parsedIssues.error.issues[0];
		const issue = projectIssues[Number(problem.path[0])];
		throw new Error(
			`The issue "${String(issue?.name)}" could not be read (${problem.path.slice(1).join('.')}: ${problem.message}).`,
		);
	}
	return {
		project_id: projectId,
		edges: records.parse(edges.data).filter(r => r.project_id === projectId),
		probabilities: records.parse(probabilities.data).filter(r => r.project_id === projectId),
		utilities: records.parse(utilities.data).filter(r => r.project_id === projectId),
		issues: parsedIssues.data,
	};
};
export type DiagramContext = Awaited<ReturnType<typeof loadChatDiagram>>;

const data = z.array(z.record(z.string(), z.unknown()));
const savePlan = z.object({
	complete: z.boolean(),
	operations: z.array(
		z.discriminatedUnion('method', [
			z.object({
				method: z.literal('delete'),
				path: z.string().regex(/^\/edges\/[0-9a-f-]{36}$/i),
			}),
			z.object({ method: z.literal('post'), path: z.literal('/edges'), data }),
			z.object({
				method: z.literal('put'),
				path: z.enum(['/discrete_probabilities', '/discrete_utilities']),
				data,
			}),
		]),
	),
});

export const saveChatDiagram = async (
	draft: Extract<ChatItemToSave, { kind: 'influence_diagram' }>,
) => {
	// Python plans connections first, then maps the API-generated table IDs.
	// The final round trip verifies that every requested write was applied.
	for (let phase = 0; phase < 3; phase++) {
		const context = await loadChatDiagram(draft.project_id);
		const plan = savePlan.parse(
			(
				await axios.post<unknown>('/ai-api/chat/diagram/save-plan', {
					project_id: draft.project_id,
					original: draft.original,
					item: draft.item,
					context,
				})
			).data,
		);
		if (plan.complete && !plan.operations.length) return;
		if (!plan.operations.length || phase === 2) break;
		for (const operation of plan.operations) {
			if (operation.method === 'delete') await apiClient.delete(operation.path);
			else await apiClient[operation.method](operation.path, operation.data);
		}
	}
	throw new Error('The server did not confirm all diagram changes. Check the diagram and retry.');
};
