import { uuid, z } from 'zod/v4';
import { parseISO } from 'date-fns';
import { strategyIconKeys } from './components/ProjectPage/Strategies/icons';

export const issueTypes = ['Unassigned', 'Decision', 'Uncertainty', 'Fact', 'Utility'] as const;
export type IssueType = (typeof issueTypes)[number];
export const boundaryTypes = ['in', 'out', 'on'] as const;
export type BoundaryType = (typeof boundaryTypes)[number];

export const roleTypes = ['Member', 'Decision Maker', 'Facilitator'] as const;
export type RoleType = (typeof roleTypes)[number];
export const objectiveTypes = ['Strategic', 'Fundamental', 'Mean'] as const;
export type ObjectiveType = (typeof objectiveTypes)[number];

export const decisionTypes = ['Policy', 'Focus', 'Tactical'] as const;
export type DecisionType = (typeof decisionTypes)[number];

export const objectiveSchema = z.object({
	id: uuid(),
	name: z.string().min(1, 'Objective name is required'),
	description: z.string().min(1, 'Description is required'),
	type: z.enum(objectiveTypes, { error: 'Objective type is required' }),
	project_id: uuid(),
	created_at: z.iso.datetime().optional(),
	updated_at: z.iso.datetime().optional(),
});

export const userSchema = z.object({
	user_id: z.string(),
	name: z.string(),
});

export const projectRoleSchema = userSchema.extend({
	id: uuid(),
	user_id: z.string(),
	project_id: uuid(),
	role: z.enum(roleTypes, { error: 'Role is required' }),
});

const optionSchema = z.object({
	name: z.string().min(1, 'Option name is required'),
	id: uuid(),
	decision_id: uuid(),
	project_id: uuid(),
	utility: z.number().optional(),
	created_at: z.iso.datetime().optional(),
});

export const strategySchema = z.object({
	id: uuid(),
	name: z.string().min(1, 'Strategy name is required'),
	icon: z.enum(strategyIconKeys, { error: 'Strategy icon is required' }),
	description: z.string().optional(),
	project_id: uuid(),
	rationale: z.string().min(1, 'Rational is required'),
	options: z.array(optionSchema),
});

export const projectSchema = z.object({
	id: uuid(),
	name: z.string().min(1, 'Name is required'),
	opportunity_statement: z.string().optional(),
	objectives: z.array(objectiveSchema, 'Objectives must be an array'),
	public: z.boolean(),
	parent_project_id: uuid().nullable(),
	parent_project_name: z.string().optional(),
	end_date: z.iso.datetime().refine(date => parseISO(date) >= new Date(), {
		message: 'End date must be in the future',
	}),
	strategies: z.array(strategySchema, 'Strategies must be an array'),
	users: z.array(projectRoleSchema, 'Users must be an array'),
});

export const decisionSchema = z.object({
	id: uuid(),
	issue_id: uuid(),
	project_id: uuid(),
	type: z.enum(decisionTypes),
	options: z.array(optionSchema),
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
	project_id: uuid(),
});

export const discreteUtilitiesSchema = z.object({
	id: uuid(),
	utility_value: z.number(),
	value_metric_id: uuid(),
	parent_option_ids: z.array(uuid()),
	parent_outcome_ids: z.array(uuid()),
	utility_id: uuid(),
	project_id: uuid(),
});

export const utilitySchema = z.object({
	id: uuid(),
	issue_id: uuid(),
	project_id: uuid(),
	discrete_utilities: z.array(discreteUtilitiesSchema),
});
export const outcomeSchema = z.object({
	id: z.uuid(),
	utility: z.number(),
	name: z.string().min(1, 'Outcome name is required'),
	uncertainty_id: z.uuid(),
	created_at: z.iso.datetime(),
	project_id: z.uuid(),
});
export const uncertaintySchema = z.object({
	id: uuid(),
	issue_id: uuid(),
	project_id: uuid(),
	is_key: z.boolean(),
	outcomes: z.array(outcomeSchema),
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
	isHighlighted: z.string().optional(),
	node_style: nodeStyleSchema,
});

export const edgeSchema = z.object({
	id: uuid(),
	head_id: uuid(),
	tail_id: uuid(),
	project_id: uuid(),
	head_issue_id: uuid().optional(),
	tail_issue_id: uuid().optional(),
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
	value_metric: valueMetricSchema.optional(),
	utility: utilitySchema,
	uncertainty: uncertaintySchema,
	node: influenceNodeSchema,
	created_at: z.iso.datetime().optional(),
	updated_at: z.iso.datetime().optional(),
});
export const projectImportFile = z.array(z.file().mime('application/json'));

export const projectImportSchema = z.object({
	projects: projectSchema,
	issues: z.array(issueSchema).optional(),
	edges: z.array(edgeSchema).optional(),
});
export const DecisionQualityAssessmentSchema = z.object({
	id: uuid(),
	appropriate_frame: z.number(),
	trade_off_analysis: z.number(),
	reasoning_correctness: z.number(),
	information_reliability: z.number(),
	commitment_to_action: z.number(),
	doable_alternatives: z.number(),
	comment: z.string().optional(),
	assessment_id: uuid(),
	project_id: uuid(),
	created_by_id: z.string().optional(),
	created_at: z.iso.datetime(),
	updated_at: z.iso.datetime().optional(),
});

export const assessmentSchema = z.object({
	id: uuid(),
	name: z.string().min(1, 'Assessment name is required'),
	project_id: uuid(),
	is_completed: z.boolean(),
	decision_quality_assessments: z.array(DecisionQualityAssessmentSchema).optional(),
	created_at: z.iso.datetime(),
});

export type ErrorHandlingState = {
	message: string;
	showDecisionTree: boolean;
};
export const evaluationMetrics = [
	{ key: 'appropriate_frame', label: 'Appropriate Frame' },
	{ key: 'trade_off_analysis', label: 'Trade-off Analysis' },
	{ key: 'doable_alternatives', label: 'Doable Alternatives' },
	{ key: 'information_reliability', label: 'Information Reliability' },
	{ key: 'reasoning_correctness', label: 'Reasoning Correctness' },
	{ key: 'commitment_to_action', label: 'Commitment to Action' },
] as const;

export type Project = z.infer<typeof projectSchema>;
export type Strategy = z.infer<typeof strategySchema>;
export type Option = z.infer<typeof optionSchema>;
export type Objective = z.infer<typeof objectiveSchema>;
export type Issue = z.infer<typeof issueSchema>;
export type Edge = z.infer<typeof edgeSchema>;
export type project = z.infer<typeof projectSchema>;
export type User = z.infer<typeof userSchema>;
export type ProjectRole = z.infer<typeof projectRoleSchema>;
export type InfluenceNode = z.infer<typeof influenceNodeSchema>;
export type DiscreteProbability = z.infer<typeof discreteProbabilitySchema>;
export type DiscreteUtility = z.infer<typeof discreteUtilitiesSchema>;
export type ProjectImportFile = z.infer<typeof projectImportFile>;
export type ProjectImportData = z.infer<typeof projectImportSchema>;
export type Assessment = z.infer<typeof assessmentSchema>;
export type DecisionQualityAssessment = z.infer<typeof DecisionQualityAssessmentSchema>;
