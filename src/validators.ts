import { int, uuid, z } from 'zod/v4';
import { parseISO } from 'date-fns';

export const issueTypes = ['Unassigned', 'Decision', 'Uncertainty', 'Fact'] as const;
export type IssueType = (typeof issueTypes)[number];

export const roleTypes = ['Member', 'Decision Maker', 'Facilitator'] as const;
export type RoleType = (typeof roleTypes)[number];

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
	is_default: z.boolean(),
	objectives: z.array(objectiveSchema),
});
export const userSchema = z.object({
	user_id: int(),
	user_name: z.string(),
	azure_id: uuid(),
});

export const projectRoleSchema = z.object({
	...userSchema.shape,
	id: uuid(),
	project_id: uuid(),
	role: z.enum(roleTypes, { error: 'Role is required' }),
});

export const projectSchema = z.object({
	id: uuid(),
	name: z.string().min(1, 'Name is required'),
	opportunityStatement: z.string().min(1, 'Opportunity statement is required'),
	isPublic: z.boolean(),
	endDate: z.iso.datetime().refine(date => parseISO(date) >= new Date(), {
		message: 'End date must be in the future',
	}),
	users: z.array(projectRoleSchema),
	scenarios: z.array(scenarioSchema),
});

export const decisionSchema = z.object({
	id: uuid(),
	issue_id: uuid(),
	options: z.array(
		z.object({
			name: z.string().min(1, 'Option name is required'),
			utility: z.number(),
			id: uuid(),
			decision_id: uuid(),
		}),
	),
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

export const uncertaintySchema = z.object({
	id: uuid(),
	issue_id: uuid(),
	outcomes: z.array(
		z.object({
			id: z.uuid(),
			name: z.string().min(1, 'Outcome name is required'),
			probability: z.number().min(0, 'min 0').max(1, 'max 1'),
			utility: z.number(),
			uncertainty_id: z.uuid(),
		}),
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

export const edgeSchema = z.object({
	id: uuid(),
	head_id: uuid(),
	tail_id: uuid(),
	scenario_id: uuid(),
});

export const issueSchema = z.object({
	id: uuid(),
	scenario_id: uuid(),
	name: z.string().min(1, 'Issue name is required'),
	description: z.string().min(1, 'Description is required'),
	order: z.number().int().nonnegative(),
	type: z.enum(issueTypes),
	boundary: z.enum(['in', 'on', 'out']),
	decision: decisionSchema,
	value_metric: valueMetricSchema,
	utility: utilitySchema,
	uncertainty: uncertaintySchema,
	node: nodeSchema,
});

export type Project = z.infer<typeof projectSchema>;
export type Opportunity = z.infer<typeof opportunitySchema>;
export type Objective = z.infer<typeof objectiveSchema>;
export type Issue = z.infer<typeof issueSchema>;
export type Edge = z.infer<typeof edgeSchema>;
export type Scenario = z.infer<typeof scenarioSchema>;
export type User = z.infer<typeof userSchema>;
export type ProjectRole = z.infer<typeof projectRoleSchema>;
