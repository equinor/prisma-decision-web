import { int, uuid, z } from 'zod/v4';
import { parseISO } from 'date-fns';

export const issueTypes = ['Unassigned', 'Decision', 'Uncertainty', 'Fact', 'Utility'] as const;
export type IssueType = (typeof issueTypes)[number];

export const roleTypes = ['Member', 'Decision Maker', 'Facilitator'] as const;
export type RoleType = (typeof roleTypes)[number];

export const decisionTypes = ['Policy', 'Focus', 'Tactical'] as const;
export type DecisionType = (typeof decisionTypes)[number];

export const opportunitySchema = z.object({
	id: uuid(),
	name: z.string().min(1, 'Opportunity name is required'),
	description: z.string().min(1, 'Description is required'),
	project_id: uuid(),
});

export const objectiveSchema = z.object({
	id: uuid(),
	name: z.string().min(1, 'Objective name is required'),
	description: z.string().min(1, 'Description is required'),
	project_id: uuid(),
	created_at: z.iso.datetime().optional(),
	updated_at: z.iso.datetime().optional(),
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
	objectives: z.array(objectiveSchema),
	public: z.boolean(),
	parent_project_id: uuid().nullable(),
	parent_project_name: z.string().optional(),
	endDate: z.iso.datetime().refine(date => parseISO(date) >= new Date(), {
		message: 'End date must be in the future',
	}),
	users: z.array(projectRoleSchema),
});

export const decisionSchema = z.object({
	id: uuid(),
	issue_id: uuid(),
	type: z.enum(decisionTypes),
	options: z.array(
		z.object({
			name: z.string().min(1, 'Option name is required'),
			id: uuid(),
			decision_id: uuid(),
			utility: z.number().optional(),
		}),
	),
});

export const valueMetricSchema = z.object({
	id: uuid(),
	issue_id: uuid(),
	name: z.string(),
});

export const discreteProbabilitySchema = z.object({
	outcome_id: uuid(),
	id: uuid(),
	parent_option_ids: z.array(uuid()),
	probability: z.number().min(0).max(1),
	parent_outcome_ids: z.array(uuid()),
	uncertainty_id: uuid(),
});

export const discreteUtilitiesSchema = z.object({
	id: uuid(),
	utility_value: z.number(),
	value_metric_id: uuid(),
	parent_option_ids: z.array(uuid()),
	parent_outcome_ids: z.array(uuid()),
	utility_id: uuid(),
});

export const utilitySchema = z.object({
	id: uuid(),
	issue_id: uuid(),
	discrete_utilities: z.array(discreteUtilitiesSchema),
});

export const uncertaintySchema = z.object({
	id: uuid(),
	issue_id: uuid(),
	is_key: z.boolean(),
	outcomes: z.array(
		z.object({
			id: z.uuid(),
			utility: z.number(),
			name: z.string().min(1, 'Outcome name is required'),
			uncertainty_id: z.uuid(),
		}),
	),
	discrete_probabilities: z.array(discreteProbabilitySchema),
});

const nodeStyleSchema = z.object({
	id: uuid(),
	node_id: uuid(),
	x_position: z.number().int(),
	y_position: z.number().int(),
});

export const influenceNodeSchema = z.object({
	id: uuid(),
	project_id: uuid(),
	issue_id: uuid(),
	name: z.string().min(1, 'Node name is required'),
	handleClassName: z.string().optional(),
	node_style: nodeStyleSchema,
});

export const edgeSchema = z.object({
	id: uuid(),
	head_id: uuid(),
	tail_id: uuid(),
	project_id: uuid(),
});

export const issueSchema = z.object({
	id: uuid(),
	project_id: uuid(),
	name: z.string().min(1, 'Issue name is required'),
	description: z.string().min(1, 'Description is required'),
	order: z.number().int().nonnegative(),
	type: z.enum(issueTypes),
	boundary: z.enum(['in', 'on', 'out']),
	decision: decisionSchema,
	value_metric: valueMetricSchema,
	utility: utilitySchema,
	uncertainty: uncertaintySchema,
	node: influenceNodeSchema,
});
export type ErrorHandlingState = {
	message: string;
	showDecisionTree: boolean;
};
export type Project = z.infer<typeof projectSchema>;
export type Opportunity = z.infer<typeof opportunitySchema>;
export type Objective = z.infer<typeof objectiveSchema>;
export type Issue = z.infer<typeof issueSchema>;
export type Edge = z.infer<typeof edgeSchema>;
export type project = z.infer<typeof projectSchema>;
export type User = z.infer<typeof userSchema>;
export type ProjectRole = z.infer<typeof projectRoleSchema>;
export type InfluenceNode = z.infer<typeof influenceNodeSchema>;
export type DiscreteProbability = z.infer<typeof discreteProbabilitySchema>;
export type DiscreteUtility = z.infer<typeof discreteUtilitiesSchema>;
