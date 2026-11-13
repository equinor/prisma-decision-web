import { z } from 'zod';
import {
	decisionSchema,
	issueSchema,
	objectiveSchema,
	strategySchema,
	type Issue,
	type Objective,
	type Strategy,
} from '../validators';
import { createIssueDraft } from './createIssueDraft';
import { getNextIssuePosition } from './getNextIssuePosition';
import { diagramInformationSchema, type ChatDiagram } from './diagramInformation';

export const objectiveInformationSchema = objectiveSchema.pick({
	name: true,
	type: true,
	description: true,
});
const stateInformationSchema = z.object({
	name: z.string().trim().min(1),
	utility: z.number(),
});
export const issueInformationSchema = issueSchema
	.pick({ name: true, type: true, boundary: true, description: true })
	.extend({
		decision: decisionSchema
			.pick({ type: true })
			.extend({
				options: z.array(stateInformationSchema).min(1),
			})
			.nullable(),
		uncertainty: z
			.object({
				is_key: z.boolean(),
				outcomes: z.array(stateInformationSchema).min(1),
			})
			.nullable(),
	});
export const strategyInformationSchema = strategySchema
	.pick({ name: true, description: true, rationale: true, icon: true, icon_color: true })
	.extend({
		description: z.string().nullable(),
		options: z.array(
			z.object({
				decision_name: z.string().trim().min(1),
				option_name: z.string().trim().min(1),
			}),
		),
	});
const interviewStageSchema = z.enum([
	'objectives',
	'issues',
	'strategies',
	'influence_diagram',
	'complete',
]);

export const chatInterviewResponseSchema = z.object({
	status: z.literal('interview'),
	reply: z.string().trim().min(1),
	stage: interviewStageSchema,
	// Python validates the full snapshot; the browser only routes and returns it.
	state: z
		.object({
			project_id: z.guid(),
			stage: interviewStageSchema,
			mode: z.enum(['guided', 'free']).optional(),
		})
		.catchall(z.unknown()),
	pending: z
		.discriminatedUnion('kind', [
			z.object({
				kind: z.literal('objective'),
				path: z.string().min(1),
				original_name: z.string().nullable().optional(),
				item: objectiveInformationSchema,
				note: z.string().nullable(),
			}),
			z.object({
				kind: z.literal('issue'),
				path: z.string().min(1),
				original_name: z.string().nullable().optional(),
				item: issueInformationSchema,
				note: z.string().nullable(),
			}),
			z.object({
				kind: z.literal('strategy'),
				original_name: z.string().nullable().optional(),
				path: z.string().min(1),
				item: strategyInformationSchema,
				note: z.string().nullable(),
			}),
			z.object({
				kind: z.literal('influence_diagram'),
				path: z.literal('influence_diagram'),
				item: diagramInformationSchema,
				original: diagramInformationSchema,
				note: z.string().nullable(),
			}),
		])
		.nullable(),
	can_finish: z.boolean(),
});

export type ChatInterviewResponse = z.infer<typeof chatInterviewResponseSchema>;
export type ChatReview = NonNullable<ChatInterviewResponse['pending']>;
export type ChatItemToSave =
	| { kind: 'objective'; path: string; item: Objective; update?: boolean }
	| { kind: 'issue'; path: string; item: Issue; update?: boolean }
	| {
			kind: 'strategy';
			path: string;
			item: z.infer<typeof strategyInformationSchema> & { id: string; project_id: string };
			update?: boolean;
	  }
	| {
			kind: 'influence_diagram';
			path: string;
			project_id: string;
			item: ChatDiagram;
			original: ChatDiagram;
	  };

export const getChatStrategyContext = (strategies: Strategy[], issues: Issue[]) =>
	strategies.map(strategy =>
		strategyInformationSchema.parse({
			...strategy,
			description: strategy.description ?? null,
			options: strategy.options.map(option => {
				const decisions = issues.filter(
					issue =>
						issue.project_id === strategy.project_id &&
						issue.decision?.id === option.decision_id,
				);
				if (decisions.length !== 1)
					throw new Error(
						`Could not find the decision for strategy "${strategy.name}". Check its selected options on the Strategies page, then retry.`,
					);
				return { decision_name: decisions[0].name, option_name: option.name };
			}),
		}),
	);

export const getChatItemToSave = (
	review: ChatReview,
	projectId: string,
	objectives: Objective[],
	issues: Issue[],
	previous: ChatItemToSave | null,
	strategies: Strategy[] = [],
): ChatItemToSave => {
	if (review.kind === 'influence_diagram')
		return {
			kind: review.kind,
			path: review.path,
			project_id: projectId,
			item: review.item,
			original: review.original,
		};
	const saved = <T extends { name: string }>(items: T[]) => {
		if (!review.original_name) return undefined;
		const original = items.find(item => item.name === review.original_name);
		if (!original)
			throw new Error(
				`"${review.original_name}" is no longer saved. Reload the page before saving.`,
			);
		return original;
	};
	if (review.kind === 'objective') {
		const original = saved(objectives);
		return {
			kind: 'objective',
			path: review.path,
			update: !!original,
			item: objectiveSchema.parse({
				...review.item,
				id:
					original?.id ??
					(previous?.kind === 'objective' ? previous.item.id : crypto.randomUUID()),
				project_id: projectId,
				ordering:
					original?.ordering ??
					Math.max(-1, ...objectives.map(item => item.ordering)) + 1,
			}),
		};
	}
	if (review.kind === 'strategy') {
		const original = saved(strategies);
		return {
			kind: 'strategy',
			path: review.path,
			update: !!original,
			item: {
				...review.item,
				...(original ? { icon: original.icon, icon_color: original.icon_color } : {}),
				id:
					original?.id ??
					(previous?.kind === 'strategy' ? previous.item.id : crypto.randomUUID()),
				project_id: projectId,
			},
		};
	}
	const original = saved(issues);
	// A changed issue keeps its IDs, order and diagram position.
	const defaults =
		original ?? (previous?.kind === 'issue' ? previous.item : createIssueDraft(projectId));
	const itemId = defaults.id;
	const position = original
		? { x: original.node.node_style.x_position, y: original.node.node_style.y_position }
		: getNextIssuePosition(issues);
	const information = review.item;
	return {
		kind: 'issue',
		path: review.path,
		update: !!original,
		item: issueSchema.parse({
			...defaults,
			id: itemId,
			name: information.name,
			description: information.description,
			type: information.type,
			boundary: information.boundary,
			order: original?.order ?? Math.max(-1, ...issues.map(item => item.order)) + 1,
			decision: {
				...defaults.decision,
				issue_id: itemId,
				type: information.decision?.type ?? defaults.decision.type,
				options: (information.decision?.options ?? []).map(option => ({
					...option,
					id:
						defaults.decision.options.find(item => item.name === option.name)?.id ??
						crypto.randomUUID(),
					decision_id: defaults.decision.id,
					project_id: projectId,
				})),
			},
			uncertainty: {
				...defaults.uncertainty,
				issue_id: itemId,
				is_key: information.uncertainty?.is_key ?? false,
				outcomes: (information.uncertainty?.outcomes ?? []).map(outcome => ({
					...outcome,
					id:
						defaults.uncertainty.outcomes.find(item => item.name === outcome.name)
							?.id ?? crypto.randomUUID(),
					uncertainty_id: defaults.uncertainty.id,
					project_id: projectId,
				})),
			},
			utility: { ...defaults.utility, issue_id: itemId },
			value_metric: defaults.value_metric
				? { ...defaults.value_metric, issue_id: itemId }
				: undefined,
			node: {
				...defaults.node,
				issue_id: itemId,
				node_style: {
					...defaults.node.node_style,
					x_position: position.x,
					y_position: position.y,
				},
			},
		}),
	};
};

export const getChatStrategyPayload = (
	draft: Extract<ChatItemToSave, { kind: 'strategy' }>,
	issues: Issue[],
): Strategy => {
	const key = (value: string) => value.trim().toLocaleLowerCase();
	const decisions = issues.filter(
		issue =>
			issue.project_id === draft.item.project_id &&
			issue.type === 'Decision' &&
			issue.boundary === 'in' &&
			issue.decision?.type === 'Focus',
	);
	const options = draft.item.options.map(selection => {
		const matchingDecisions = decisions.filter(
			issue => key(issue.name) === key(selection.decision_name),
		);
		if (matchingDecisions.length !== 1)
			throw new Error(
				`The Focus decision "${selection.decision_name}" is missing or ambiguous. Check the Issues page before saving.`,
			);
		const matchingOptions = matchingDecisions[0].decision.options.filter(
			option => key(option.name) === key(selection.option_name),
		);
		if (matchingOptions.length !== 1)
			throw new Error(
				`The option "${selection.option_name}" for "${selection.decision_name}" is missing or ambiguous. Check the Issues page before saving.`,
			);
		return matchingOptions[0];
	});
	if (
		options.length !== decisions.length ||
		decisions.some(
			issue =>
				options.filter(option => option.decision_id === issue.decision.id).length !== 1,
		)
	)
		throw new Error(
			'Choose one existing option for every in-scope Focus decision before saving the strategy.',
		);
	return strategySchema.parse({
		...draft.item,
		description: draft.item.description ?? '',
		options,
	});
};
