import { z } from 'zod';

const parentStates = z.array(z.object({ issue_name: z.string(), state_name: z.string() }));
export const diagramInformationSchema = z.object({
	edges: z.array(z.object({ tail_issue_name: z.string(), head_issue_name: z.string() })),
	discrete_probabilities: z.array(
		z.object({
			uncertainty_name: z.string(),
			outcome_name: z.string(),
			probability: z.number().min(0).max(1),
			parent_states: parentStates,
		}),
	),
	discrete_utilities: z.array(
		z.object({
			utility_name: z.string(),
			utility_value: z.number(),
			parent_states: parentStates,
		}),
	),
});
export type ChatDiagram = z.infer<typeof diagramInformationSchema>;
