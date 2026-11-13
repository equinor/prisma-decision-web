import { z } from 'zod';
import type { Issue, Objective, Project } from '../validators';
import { projectSchema } from '../validators';
import {
	getChatItemToSave,
	issueInformationSchema,
	objectiveInformationSchema,
	strategyInformationSchema,
	type ChatItemToSave,
} from './chatInterview';
import { diagramInformationSchema, type ChatDiagram } from './diagramInformation';
import { getProjectFromIntake } from './projectDefaults';

const projectInformationSchema = z.object({
	project_name: z.string().trim().min(1),
	opportunity_statement: z.string().trim().min(1),
	end_date: z.iso.date().nullable(),
	public_project: z.boolean(),
});
const note = z.string().nullable();
const path = z.string().min(1);

export const quickStartResponseSchema = z.object({
	reply: z.string().trim().min(1),
	// Python validates the full snapshot; the browser only returns it.
	state: z.object({ project: z.unknown() }).catchall(z.unknown()),
	pending: z
		.discriminatedUnion('kind', [
			z.object({ kind: z.literal('project'), path, item: projectInformationSchema, note }),
			z.object({
				kind: z.literal('objective'),
				path,
				item: objectiveInformationSchema,
				note,
			}),
			z.object({ kind: z.literal('issue'), path, item: issueInformationSchema, note }),
			z.object({ kind: z.literal('strategy'), path, item: strategyInformationSchema, note }),
			z.object({
				kind: z.literal('influence_diagram'),
				path,
				item: diagramInformationSchema,
				note,
			}),
		])
		.nullable(),
	shortcut: z.object({ label: z.string().min(1), message: z.string().min(1) }).nullable(),
	progress: z.object({
		project_information: z.boolean(),
		objectives: z.number().int(),
		issues: z.number().int(),
		strategies: z.number().int(),
		influence_connections: z.number().int(),
	}),
	complete: z.boolean(),
});

const quickStartResultSchema = z.object({
	project_information: projectInformationSchema,
	objectives: z.object({ objectives: z.array(objectiveInformationSchema).min(1) }),
	issues: z.object({ issues: z.array(issueInformationSchema).min(1) }),
	strategies: z.object({ strategies: z.array(strategyInformationSchema) }),
	influence_diagram: diagramInformationSchema,
});

export type QuickStartResponse = z.infer<typeof quickStartResponseSchema>;
export type QuickStartReview = NonNullable<QuickStartResponse['pending']>;
export type QuickStartRecords = {
	project: Project;
	objectives: Objective[];
	issues: Issue[];
	strategies: Extract<ChatItemToSave, { kind: 'strategy' }>[];
	diagram: ChatDiagram;
};

// IDs are generated once, so retrying creation never makes duplicates.
export const getQuickStartRecords = (
	response: QuickStartResponse,
	defaults: Project,
): QuickStartRecords => {
	const result = quickStartResultSchema.parse(response.state.project);
	const project = projectSchema.parse(getProjectFromIntake(defaults, result.project_information));
	const objectives: Objective[] = [];
	for (const item of result.objectives.objectives) {
		const saved = getChatItemToSave(
			{ kind: 'objective', path: item.name, item, note: null },
			project.id,
			objectives,
			[],
			null,
		);
		if (saved.kind === 'objective') objectives.push(saved.item);
	}
	const issues: Issue[] = [];
	for (const item of result.issues.issues) {
		const saved = getChatItemToSave(
			{ kind: 'issue', path: item.name, item, note: null },
			project.id,
			[],
			issues,
			null,
		);
		if (saved.kind === 'issue') issues.push(saved.item);
	}
	return {
		project,
		objectives,
		issues,
		strategies: result.strategies.strategies.map(item => ({
			kind: 'strategy',
			path: item.name,
			item: { ...item, id: crypto.randomUUID(), project_id: project.id },
		})),
		diagram: result.influence_diagram,
	};
};
