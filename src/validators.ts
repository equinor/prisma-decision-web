import { uuid, z } from 'zod/v4';

export const issueTypes = ['Decision', 'Uncertainty', 'Fact', 'Unassigned', 'Value'] as const;

export const opportunitySchema = z.object({
	id: uuid(),
	name: z.string().min(1, 'Opportunity name is required'),
	description: z.string().min(1, 'Description is required'),
	scenario_id: uuid(),
});

export const objectiveSchema = z.object({
	id: uuid(),
	name: z.string().min(1, 'Objective name is required'),
	description: z.string().min(1, 'Description is required'),
	scenario_id: uuid(),
});

export const scenarioSchema = z.object({
	id: uuid(),
	name: z.string().min(1, 'Scenario name is required'),
	project_id: uuid(),
	objectives: z.array(objectiveSchema),
	opportunities: z.array(opportunitySchema),
});

export const projectSchema = z.object({
	description: z.string().min(1, 'Description is required'),
	name: z.string().min(1, 'Name is required'),
	id: uuid(),
	scenarios: z.array(scenarioSchema),
});

export const decisionSchema = z.object({
	id: uuid(),
	issue_id: uuid(),
	alternatives: z.array(z.string().min(1, 'Alternative is required')),
});

export const valueMetricSchema = z.object({
	id: uuid(),
	issue_id: uuid(),
	name: z.string(),
});

export const utilitySchema = z.object({
	id: uuid(),
	issue_id: uuid(),
	values: z.array(z.number().int()),
});

export const uncertaintyScehma = z.object({
	id: uuid(),
	issue_id: uuid(),
	probabilities: z.array(
		z
			.number()
			.min(0, 'Probability must be non-negative')
			.max(1, 'Probability must be at most 1'),
	),
});

const nodeStyleSchema = z.object({
	id: uuid(),
	node_id: uuid(),
	x_position: z.number().int(),
	y_position: z.number().int(),
});

export const nodeSchema = z.object({
	id: uuid(),
	scenario_id: uuid(),
	issue_id: uuid(),
	name: z.string().min(1, 'Node name is required'),
	node_style: nodeStyleSchema,
});

export const issueSchema = z.object({
	id: uuid(),
	scenario_id: uuid(),
	name: z.string().min(1, 'Issue name is required'),
	description: z.string().min(1, 'Description is required'),
	order: z.number().int().nonnegative(),
	type: z.enum(issueTypes),
	boundry: z.enum(['in', 'on', 'out']),
	decision: decisionSchema,
	value_metric: valueMetricSchema,
	utility: utilitySchema,
	uncertainty: uncertaintyScehma,
	node: nodeSchema,
});

export type Project = z.infer<typeof projectSchema>;
export type Opportunity = z.infer<typeof opportunitySchema>;
export type Objective = z.infer<typeof objectiveSchema>;
export type Issue = z.infer<typeof issueSchema>;
