import { guid, uuid, z } from 'zod/v4';
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

export const WhiteboardNodeTypes = ['Issue', 'Rectangle', 'Text', 'Arrow', 'Freehand'] as const;
export type WhiteboardNodeType = (typeof WhiteboardNodeTypes)[number];

export const objectiveSchema = z.object({
	id: z.guid(),
	name: z.string().min(1, 'Objective name is required'),
	description: z.string().min(1, 'Description is required'),
	type: z.enum(objectiveTypes, { error: 'Objective type is required' }),
	ordering: z.number().int(),
	project_id: z.guid(),
	created_at: z.iso.datetime().optional(),
	updated_at: z.iso.datetime().optional(),
});

export const userSchema = z.object({
	user_id: z.string(),
	name: z.string(),
});

export const projectRoleSchema = userSchema.extend({
	id: z.guid(),
	user_id: z.string(),
	project_id: z.guid(),
	role: z.enum(roleTypes, { error: 'Role is required' }),
});

const optionSchema = z.object({
	name: z.string().min(1, 'Option name is required'),
	id: z.guid(),
	decision_id: z.guid(),
	project_id: z.guid(),
	utility: z.number().optional(),
	created_at: z.iso.datetime().optional(),
});

export const strategySchema = z.object({
	id: z.guid(),
	name: z.string().min(1, 'Strategy name is required'),
	icon: z.enum(strategyIconKeys, { error: 'Strategy icon is required' }),
	icon_color: z.string().optional(),
	description: z.string().optional(),
	project_id: z.guid(),
	rationale: z.string().min(1, 'Rational is required'),
	options: z.array(optionSchema),
});

export const whiteboardNode = z.object({
	id: uuid(),
	board_sheet_id: guid(),
	project_id: uuid(),
	height: z.float64(),
	width: z.float64(),
	x_position: z.float64(),
	y_position: z.float64(),
	rotation: z.float64(),
	data: z.string(),
	stroke_width: z.number().optional(),
	stroke_style: z.enum(['Solid', 'Dashed', 'Dotted']).optional(),
	text_size: z.number().optional(),
	opacity: z.number().min(0).max(100).optional(),
	color: z.string().optional(),
	type: z.enum(WhiteboardNodeTypes),
	new: z.boolean().optional(),
});

export const whiteboardSheet = z.object({
	id: guid(),
	project_id: guid(),
	name: z.string().min(1, 'Sheet name is required'),
});

export const projectSchema = z.object({
	id: z.guid(),
	name: z.string().min(1, 'Name is required'),
	opportunity_statement: z.string().optional(),
	public: z.boolean(),
	favorite: z.boolean(),
	parent_project_id: z.guid().nullable(),
	parent_project_name: z.string().optional(),
	end_date: z.iso.datetime(),
	users: z.array(projectRoleSchema, 'Users must be an array'),
});

export const decisionSchema = z.object({
	id: z.guid(),
	issue_id: z.guid(),
	project_id: z.guid(),
	type: z.enum(decisionTypes),
	options: z.array(optionSchema),
});

export const valueMetricSchema = z.object({
	id: z.guid(),
	issue_id: z.guid(),
	name: z.string(),
});

export const discreteProbabilitySchema = z.object({
	outcome_id: z.guid(),
	id: z.guid(),
	parent_option_ids: z.array(z.guid()),
	parent_outcome_ids: z.array(z.guid()),
	probability: z.number().min(0).max(1),
	uncertainty_id: z.guid(),
	project_id: z.guid(),
});

export const discreteUtilitiesSchema = z.object({
	id: z.guid(),
	utility_value: z.number(),
	value_metric_id: z.guid(),
	parent_option_ids: z.array(z.guid()),
	parent_outcome_ids: z.array(z.guid()),
	utility_id: z.guid(),
	project_id: z.guid(),
});

export const utilitySchema = z.object({
	id: z.guid(),
	issue_id: z.guid(),
	project_id: z.guid(),
});
export const outcomeSchema = z.object({
	id: z.guid(),
	utility: z.number(),
	name: z.string().min(1, 'Outcome name is required'),
	uncertainty_id: z.uuid(),
	created_at: z.iso.datetime().optional(),
	project_id: z.uuid(),
});
export const uncertaintySchema = z.object({
	id: z.guid(),
	issue_id: z.guid(),
	project_id: z.guid(),
	is_key: z.boolean(),
	outcomes: z.array(outcomeSchema),
});

const nodeStyleSchema = z.object({
	id: z.guid(),
	node_id: z.guid(),
	x_position: z.number().int(),
	y_position: z.number().int(),
});

export const influenceNodeSchema = z.object({
	id: z.guid(),
	project_id: z.guid(),
	issue_id: z.guid(),
	name: z.string().min(1, 'Node name is required'),
	isHighlighted: z.string().optional(),
	node_style: nodeStyleSchema,
});

export const edgeSchema = z.object({
	id: z.guid(),
	head_id: z.guid(),
	tail_id: z.guid(),
	project_id: z.guid(),
	head_issue_id: z.guid().optional(),
	tail_issue_id: z.guid().optional(),
});

export const issueSchema = z.object({
	id: z.guid(),
	project_id: z.guid(),
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

const restrictionEntrySchema = z.object({
	created_at: z.string(),
	updated_at: z.string(),
	id: z.string(),
	restriction_value: z.number(),
	parent_state_id: z.guid(),
	is_parent_uncertainty: z.boolean(),
	child_state_id: z.guid(),
	is_child_uncertainty: z.boolean(),
	restriction_table_id: z.guid(),
});

export const restrictionTableSchema = z.object({
	created_at: z.string(),
	updated_at: z.string(),
	id: z.string(),
	name: z.string(),
	project_id: z.string(),
	edge_id: z.string(),
	restriction_entries: z.array(restrictionEntrySchema),
});

export const projectImportSchema = z.object({
	projects: projectSchema,
	Objectives: z.array(objectiveSchema).optional(),
	issues: z.array(issueSchema).optional(),
	edges: z.array(edgeSchema).optional(),
	Strategies: z.array(strategySchema).optional(),
	discrete_probabilities: z.array(discreteProbabilitySchema).optional(),
	discrete_utilities: z.array(discreteUtilitiesSchema).optional(),
	restriction_tables: z.array(restrictionTableSchema).optional(),
});
const metricScore = () =>
	z.number().min(0, 'Value must be at least 0').max(100, 'Value must be 100 or less');

export const DecisionQualityAssessmentSchema = z.object({
	id: z.guid(),
	appropriate_frame: metricScore(),
	trade_off_analysis: metricScore(),
	reasoning_correctness: metricScore(),
	information_reliability: metricScore(),
	commitment_to_action: metricScore(),
	doable_alternatives: metricScore(),
	comment: z.string().optional(),
	assessment_id: z.guid(),
	project_id: z.guid(),
	created_by_id: z.string().optional(),
	created_at: z.iso.datetime(),
	updated_at: z.iso.datetime().optional(),
});

export const assessmentSchema = z.object({
	id: z.guid(),
	name: z.string().min(1, 'Assessment name is required'),
	project_id: z.guid(),
	is_completed: z.boolean(),
	decision_quality_assessments: z.array(DecisionQualityAssessmentSchema).optional(),
	created_at: z.iso.datetime(),
});

export const solutionEvidenceResponseSchema = z.object({
	evidence_id: z.guid(), // id for the evidence collection, corresponds to for example the strategy id
	state_ids: z.array(z.guid()),
	expected_utility: z.number().default(0),
});

export const probabilityTableSchema = z.object({
	issue_id: z.guid(),
	discrete_probabilities: z.array(discreteProbabilitySchema),
});

export const utilityTableSchema = z.object({
	issue_id: z.guid(),
	discrete_utilities: z.array(discreteUtilitiesSchema),
});

export const policyTableSchema = z.object({
	decision_id: z.guid(),
	parent_state_ids: z.array(z.guid()),
	option_id: z.guid(),
	value: z.number(),
});
export const policyTableWithParentOptionOutcomeSchema = z.object({
	decision_id: z.guid(),
	parent_state_ids: z.array(z.guid()),
	parent_option_ids: z.array(z.guid()),
	option_id: z.guid(),
	value: z.number(),
});

export type ErrorHandlingState = {
	message: string;
	showDecisionTree: boolean;
};
export const evaluationMetrics = [
	{ key: 'appropriate_frame', label: 'Appropriate Frame', defaultValue: 50 },
	{ key: 'trade_off_analysis', label: 'Trade-off Analysis', defaultValue: 50 },
	{ key: 'doable_alternatives', label: 'Doable Alternatives', defaultValue: 50 },
	{ key: 'information_reliability', label: 'Information Reliability', defaultValue: 50 },
	{ key: 'reasoning_correctness', label: 'Reasoning Correctness', defaultValue: 50 },
	{ key: 'commitment_to_action', label: 'Commitment to Action', defaultValue: 50 },
] as const;

export type Project = z.infer<typeof projectSchema>;
export type Strategy = z.infer<typeof strategySchema>;
export type Option = z.infer<typeof optionSchema>;
export type Outcome = z.infer<typeof outcomeSchema>;
export type Objective = z.infer<typeof objectiveSchema>;
export type Issue = z.infer<typeof issueSchema>;
export type Edge = z.infer<typeof edgeSchema>;
export type project = z.infer<typeof projectSchema>;
export type User = z.infer<typeof userSchema>;
export type ProjectRole = z.infer<typeof projectRoleSchema>;
export type InfluenceNode = z.infer<typeof influenceNodeSchema>;
export type DiscreteProbability = z.infer<typeof discreteProbabilitySchema>;
export type DiscreteUtility = z.infer<typeof discreteUtilitiesSchema>;
export type UtilityTable = z.infer<typeof utilityTableSchema>;
export type ProjectImportFile = z.infer<typeof projectImportFile>;
export type ProjectImportData = z.infer<typeof projectImportSchema>;
export type Assessment = z.infer<typeof assessmentSchema>;
export type DecisionQualityAssessment = z.infer<typeof DecisionQualityAssessmentSchema>;
export type SolutionEvidenceResponse = z.infer<typeof solutionEvidenceResponseSchema>;
export type WhiteboardNode = z.infer<typeof whiteboardNode>;
export type WhiteboardSheet = z.infer<typeof whiteboardSheet>;
export type Uncertainty = z.infer<typeof uncertaintySchema>;
export type ProbabilityTable = z.infer<typeof probabilityTableSchema>;
export type RestrictionEntry = z.infer<typeof restrictionEntrySchema>;
export type RestrictionTable = z.infer<typeof restrictionTableSchema>;
export type PolicyTableWithParentOptionOutcome = z.infer<
	typeof policyTableWithParentOptionOutcomeSchema
>;
export type PolicyTable = z.infer<typeof policyTableSchema>;
