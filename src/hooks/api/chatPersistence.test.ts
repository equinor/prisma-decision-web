import axios from 'axios';
import { afterEach, expect, test, vi } from 'vitest';
import { apiClient } from '../../api';
import { createIssueDraft } from '../../utils/createIssueDraft';
import {
	getChatItemToSave,
	getChatStrategyPayload,
	type ChatItemToSave,
} from '../../utils/chatInterview';
import type { ChatDiagram } from '../../utils/diagramInformation';
import { issueSchema, type Strategy } from '../../validators';
import { loadChatDiagram, saveChatDiagram } from './useChatDiagram';

type ChatRequestBody = {
	project_id: string;
	context: {
		edges: { id: string }[];
		probabilities: { probability: number }[];
		utilities: object[];
	};
};

afterEach(() => vi.restoreAllMocks());

const projectId = crypto.randomUUID();
const weather = issueSchema.parse({
	...createIssueDraft(projectId),
	name: 'Weather',
	description: 'Event weather',
	type: 'Uncertainty',
	boundary: 'in',
});
weather.uncertainty.is_key = true;
weather.uncertainty.outcomes = ['Dry', 'Wet'].map(name => ({
	id: crypto.randomUUID(),
	project_id: projectId,
	uncertainty_id: weather.uncertainty.id,
	name,
	utility: 0,
}));
const value = issueSchema.parse({
	...createIssueDraft(projectId),
	name: 'Value',
	description: 'Event value',
	type: 'Utility',
	boundary: 'in',
});

test('diagram persistence removes/adds connections, updates generated tables and retries safely', async () => {
	const oldEdge = {
		id: crypto.randomUUID(),
		project_id: projectId,
		tail_id: value.node.id,
		head_id: weather.node.id,
	};
	let edges: object[] = [oldEdge];
	let probabilities: object[] = weather.uncertainty.outcomes.map(outcome => ({
		id: crypto.randomUUID(),
		project_id: projectId,
		uncertainty_id: weather.uncertainty.id,
		outcome_id: outcome.id,
		parent_option_ids: [],
		parent_outcome_ids: [],
		probability: 0.5,
	}));
	let utilities: object[] = [];
	const writes: string[][] = [];
	vi.spyOn(apiClient, 'get').mockImplementation((async (url: string) => ({
		data: structuredClone(
			{
				'/issues': [weather, value],
				'/edges': edges,
				'/discrete_probabilities': probabilities,
				'/discrete_utilities': utilities,
			}[url],
		),
	})) as never);
	vi.spyOn(apiClient, 'delete').mockImplementation((async (url: string) => {
		writes.push(['delete', url]);
		edges = [];
		return { data: [] };
	}) as never);
	vi.spyOn(apiClient, 'post').mockImplementation((async (url: string, rows: object[]) => {
		writes.push(['post', url]);
		edges = structuredClone(rows);
		utilities = weather.uncertainty.outcomes.map(outcome => ({
			id: crypto.randomUUID(),
			project_id: projectId,
			utility_id: value.utility.id,
			value_metric_id: crypto.randomUUID(),
			parent_option_ids: [],
			parent_outcome_ids: [outcome.id],
			utility_value: 0,
		}));
		return { data: rows };
	}) as never);
	vi.spyOn(apiClient, 'put').mockImplementation((async (url: string, rows: object[]) => {
		writes.push(['put', url]);
		if (url === '/discrete_probabilities') probabilities = structuredClone(rows);
		if (url === '/discrete_utilities') utilities = structuredClone(rows);
		return { data: rows };
	}) as never);
	try {
		const context = await loadChatDiagram(projectId);
		expect(context.project_id).toBe(projectId);
		const original: ChatDiagram = {
			edges: [{ tail_issue_name: 'Value', head_issue_name: 'Weather' }],
			discrete_probabilities: [
				{
					uncertainty_name: 'Weather',
					outcome_name: 'Dry',
					probability: 0.5,
					parent_states: [],
				},
				{
					uncertainty_name: 'Weather',
					outcome_name: 'Wet',
					probability: 0.5,
					parent_states: [],
				},
			],
			discrete_utilities: [],
		};
		const item = structuredClone(original);
		item.edges = [{ tail_issue_name: 'Weather', head_issue_name: 'Value' }];
		item.discrete_probabilities[0].probability = 0.7;
		item.discrete_probabilities[1].probability = 0.3;
		item.discrete_utilities = [
			{
				utility_name: 'Value',
				utility_value: 100,
				parent_states: [{ issue_name: 'Weather', state_name: 'Dry' }],
			},
			{
				utility_name: 'Value',
				utility_value: 20,
				parent_states: [{ issue_name: 'Weather', state_name: 'Wet' }],
			},
		];
		const draft: Extract<ChatItemToSave, { kind: 'influence_diagram' }> = {
			kind: 'influence_diagram',
			path: 'influence_diagram',
			project_id: projectId,
			item,
			original,
		};
		vi.spyOn(axios, 'post').mockImplementation((async (_url: string, body: ChatRequestBody) => {
			expect(body.project_id).toBe(projectId);
			const operations = body.context.edges.some(
				(edge: { id: string }) => edge.id === oldEdge.id,
			)
				? [
						{ method: 'delete', path: `/edges/${oldEdge.id}` },
						{
							method: 'post',
							path: '/edges',
							data: [
								{
									id: crypto.randomUUID(),
									project_id: projectId,
									tail_id: weather.node.id,
									head_id: value.node.id,
								},
							],
						},
					]
				: body.context.probabilities[0].probability === 0.5
					? [
							{
								method: 'put',
								path: '/discrete_probabilities',
								data: body.context.probabilities.map((row: object, i: number) => ({
									...row,
									probability: i === 0 ? 0.7 : 0.3,
								})),
							},
							{
								method: 'put',
								path: '/discrete_utilities',
								data: body.context.utilities.map((row: object, i: number) => ({
									...row,
									utility_value: i === 0 ? 100 : 20,
								})),
							},
						]
					: [];
			return { data: { complete: !operations.length, operations } };
		}) as never);
		await saveChatDiagram(draft);
		expect(
			writes.map(([method, path]) => [
				method,
				path.startsWith('/edges/') ? '/edges/id' : path,
			]),
		).toEqual([
			['delete', '/edges/id'],
			['post', '/edges'],
			['put', '/discrete_probabilities'],
			['put', '/discrete_utilities'],
		]);
		expect(probabilities.map(row => (row as { probability: number }).probability)).toEqual([
			0.7, 0.3,
		]);
		expect(utilities.map(row => (row as { utility_value: number }).utility_value)).toEqual([
			100, 20,
		]);
		const count = writes.length;
		await saveChatDiagram(draft);
		expect(writes.length).toBe(count);
	} finally {
		vi.restoreAllMocks();
	}
});

test('strategy review preserves the original ID, icon and selected option IDs', () => {
	const saved: Strategy = {
		id: crypto.randomUUID(),
		project_id: projectId,
		name: 'Original',
		description: '',
		rationale: 'Simple',
		options: [],
		icon: 'flower',
		icon_color: '#123456',
	};
	const draft = getChatItemToSave(
		{
			kind: 'strategy',
			path: 'strategies.strategies[renamed]',
			original_name: 'Original',
			note: null,
			item: {
				name: 'Renamed',
				description: '',
				rationale: 'Flexible',
				options: [],
				icon: 'flash',
				icon_color: '#007079',
			},
		},
		projectId,
		[],
		[],
		null,
		[saved],
	);
	if (draft.kind !== 'strategy') throw new Error('Expected a strategy draft');
	expect(draft.item.id).toBe(saved.id);
	expect(draft.item.icon).toBe(saved.icon);
	expect(draft.update).toBe(true);
	expect(getChatStrategyPayload(draft, [])).toEqual({
		...saved,
		name: 'Renamed',
		rationale: 'Flexible',
	});
});

test('a changed issue keeps its IDs, order and diagram position', () => {
	const saved = { ...weather, order: 4 };
	saved.node.node_style.x_position = 123;
	const draft = getChatItemToSave(
		{
			kind: 'issue',
			path: 'issues.issues[weather]',
			original_name: 'Weather',
			note: null,
			item: {
				name: 'Weather',
				description: 'Rain or sun on the day',
				type: 'Uncertainty',
				boundary: 'in',
				decision: null,
				uncertainty: {
					is_key: true,
					outcomes: [
						{ name: 'Dry', utility: 0 },
						{ name: 'Wet', utility: 0 },
					],
				},
			},
		},
		projectId,
		[],
		[saved, value],
		null,
	);
	if (draft.kind !== 'issue') throw new Error('Expected an issue draft');
	expect(draft.update).toBe(true);
	expect(draft.item.id).toBe(saved.id);
	expect(draft.item.order).toBe(4);
	expect(draft.item.node.node_style.x_position).toBe(123);
	expect(draft.item.uncertainty.outcomes.map(o => o.id)).toEqual(
		saved.uncertainty.outcomes.map(o => o.id),
	);
	expect(draft.item.description).toBe('Rain or sun on the day');
});
