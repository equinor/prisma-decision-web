import { getOutgoers, Node, Edge as ReactFlowEdge } from '@xyflow/react';
import {
	Edge as InfluenceEdge,
	InfluenceNode as InfluenceNodeType,
	Issue,
	ProbabilityTable,
	RestrictionEntry,
	RestrictionTable,
} from '../validators';
import { hasInvalidProbabilitySum } from './getDiscreteProbabiltyRows';
import { getRestrictedEntriesForTargetNode } from './getProbabilityRestrictions';

export const getNodesInOrOnBoundary = (
	nodes: Node<InfluenceNodeType>[],
	issues: Issue[],
): Node<InfluenceNodeType>[] => {
	return nodes.filter(node => {
		const issue = issues.find(i => i.id === node.data.issue_id);
		if (!issue) return false;
		const inOrOnBoundary = issue.boundary === 'in' || issue.boundary === 'on';
		if (issue.type === 'Decision') return inOrOnBoundary && issue.decision.type === 'Focus';
		if (issue.type === 'Uncertainty') return inOrOnBoundary && issue.uncertainty.is_key;
		if (issue.type === 'Utility') return inOrOnBoundary;
		return false;
	});
};

export const getIssuesWithInvalidProbabilityTable = (
	issues: Issue[],
	probabilityTables: ProbabilityTable[],
	edges: InfluenceEdge[],
	restrictionTables: RestrictionTable[],
): ProbabilityTable[] => {
	return probabilityTables.filter(pt => {
		const issue = issues.find(i => i.id === pt.issue_id);
		if (!issue) return false;
		const isUncertainty =
			issue.type === 'Uncertainty' &&
			issue.uncertainty.is_key &&
			(issue.boundary === 'in' || issue.boundary === 'on');
		const hasDiscreteProbability = pt?.discrete_probabilities?.length > 0;
		if (!isUncertainty || !hasDiscreteProbability) return false;

		const restrictedEntries = getRestrictedEntriesForTargetNode(
			issue.node.id,
			edges,
			restrictionTables,
		);

		return hasInvalidProbabilitySum(pt.discrete_probabilities, issues, restrictedEntries);
	});
};

export const getEdgesInCycle = (nodes: Node[], edges: ReactFlowEdge[]): Set<string> => {
	const cycleEdgeIds = new Set<string>();

	for (const edge of edges) {
		const targetNode = nodes.find(n => n.id === edge.target);
		if (!targetNode) continue;

		const visited = new Set<string>();
		const hasPathTo = (current: Node, targetId: string): boolean => {
			if (current.id === targetId) return true;
			if (visited.has(current.id)) return false;
			visited.add(current.id);

			for (const outgoer of getOutgoers(current, nodes, edges)) {
				if (hasPathTo(outgoer, targetId)) return true;
			}
			return false;
		};

		if (hasPathTo(targetNode, edge.source)) {
			cycleEdgeIds.add(edge.id);
		}
	}

	return cycleEdgeIds;
};

export const ValidateProbabilityTable = (
	nodes: Node<InfluenceNodeType>[],
	issues: Issue[],
	probabilityTables: ProbabilityTable[],
	edges: InfluenceEdge[],
	restrictionTables: RestrictionTable[],
) => {
	const nodeIssueIds = new Set(nodes.map(n => n.data.issue_id));
	const nodeIssues = issues.filter(i => nodeIssueIds.has(i.id));
	return getIssuesWithInvalidProbabilityTable(
		nodeIssues,
		probabilityTables,
		edges,
		restrictionTables,
	).map(pt => pt.issue_id);
};

export const hasLoops = (
	nodes: Node<InfluenceNodeType>[],
	edges: ReactFlowEdge[],
	issues: Issue[],
) => {
	const filteredNodes = getNodesInOrOnBoundary(nodes, issues);
	const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
	const filteredEdges = edges.filter(
		e => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target),
	);
	const cycleEdgeIds = getEdgesInCycle(filteredNodes, filteredEdges);
	return filteredEdges.filter(edge => cycleEdgeIds.has(edge.id));
};

export const hasIssues = (nodes: Node<InfluenceNodeType>[], issues: Issue[]): boolean => {
	return getNodesInOrOnBoundary(nodes, issues).length > 0;
};

export const hasMissingEdges = (edges: { length: number }): boolean => {
	return edges.length === 0;
};

export const hasOptionsMissing = (nodes: Node<InfluenceNodeType>[], issues: Issue[]) => {
	const filteredNodes = getNodesInOrOnBoundary(nodes, issues);
	return filteredNodes
		.filter(node => {
			const issue = issues.find(i => i.id === node.data.issue_id);
			return issue?.type === 'Decision' && issue.decision?.options?.length === 0;
		})
		.map(node => node.data.issue_id);
};

export const hasOutcomesMissing = (nodes: Node<InfluenceNodeType>[], issues: Issue[]) => {
	const filteredNodes = getNodesInOrOnBoundary(nodes, issues);
	return filteredNodes
		.filter(node => {
			const issue = issues.find(i => i.id === node.data.issue_id);
			return issue?.type === 'Uncertainty' && issue.uncertainty?.outcomes?.length === 0;
		})
		.map(node => node.data.issue_id);
};

const getIssueStateIds = (issue: Issue): string[] => {
	if (issue.type === 'Decision') return issue.decision.options.map(option => option.id);
	if (issue.type === 'Uncertainty') return issue.uncertainty.outcomes.map(outcome => outcome.id);
	return [];
};

export type TotalRestrictionViolation = {
	edgeId: string;
	parentStateId: string;
	rule: 'uncertaintyParent' | 'missingGrandchildEdges';
	missingGrandchildIssueIds: string[];
};

export type TotalRestrictionErrors = {
	uncertaintyParentRestriction: string[];
	missingGrandchildEdges: string[];
	violations: TotalRestrictionViolation[];
};

export const validateTotalRestriction = (
	nodes: Node<InfluenceNodeType>[],
	issues: Issue[],
	edges: InfluenceEdge[],
	restrictionTables: RestrictionTable[],
): TotalRestrictionErrors => {
	const diagramNodes = getNodesInOrOnBoundary(nodes, issues);
	const issuesById = new Map(issues.map(issue => [issue.id, issue]));
	const nodesById = new Map(diagramNodes.map(node => [node.id, node]));
	const diagramEdges = edges.filter(
		edge => nodesById.has(edge.tail_id) && nodesById.has(edge.head_id),
	);
	const restrictionTablesByEdgeId = new Map(
		restrictionTables.map(table => [table.edge_id, table]),
	);
	const edgePairs = new Set(diagramEdges.map(edge => `${edge.tail_id}:${edge.head_id}`));
	const uncertaintyParentRestrictionIssueIds = new Set<string>();
	const missingGrandchildEdgeIssueIds = new Set<string>();
	const violations: TotalRestrictionViolation[] = [];

	for (const node of diagramNodes) {
		const targetIssue = issuesById.get(node.data.issue_id);
		if (!targetIssue) continue;

		const childStateIds = getIssueStateIds(targetIssue);
		if (!childStateIds.length) continue;

		const incomingEdges = diagramEdges.filter(edge => edge.head_id === node.id);
		const outgoingEdges = diagramEdges.filter(edge => edge.tail_id === node.id);
		const hasUncertaintyChild = outgoingEdges.some(edge => {
			const childNode = nodesById.get(edge.head_id);
			return childNode && issuesById.get(childNode.data.issue_id)?.type === 'Uncertainty';
		});

		for (const edge of incomingEdges) {
			const parentNode = nodesById.get(edge.tail_id);
			const parentIssue = parentNode ? issuesById.get(parentNode.data.issue_id) : undefined;
			const restrictionTable = restrictionTablesByEdgeId.get(edge.id);
			if (!parentIssue || !parentNode || !restrictionTable) continue;

			const completelyRestrictedStateIds = getIssueStateIds(parentIssue).filter(
				parentStateId =>
					childStateIds.every(childStateId =>
						restrictionTable.restriction_entries.some(
							entry =>
								entry.parent_state_id === parentStateId &&
								entry.child_state_id === childStateId &&
								entry.restriction_value === 0,
						),
					),
			);
			if (!completelyRestrictedStateIds.length) continue;

			if (hasUncertaintyChild) {
				uncertaintyParentRestrictionIssueIds.add(targetIssue.id);
				for (const parentStateId of completelyRestrictedStateIds) {
					violations.push({
						edgeId: edge.id,
						parentStateId,
						rule: 'uncertaintyParent',
						missingGrandchildIssueIds: [],
					});
				}
				continue;
			}

			const missingGrandchildIssueIds: string[] = [];
			for (const grandchildEdge of outgoingEdges) {
				if (edgePairs.has(`${parentNode.id}:${grandchildEdge.head_id}`)) continue;
				const grandchildNode = nodesById.get(grandchildEdge.head_id);
				if (
					grandchildNode &&
					issuesById.get(grandchildNode.data.issue_id)?.type === 'Utility'
				) {
					continue;
				}
				if (grandchildNode) {
					missingGrandchildEdgeIssueIds.add(grandchildNode.data.issue_id);
					missingGrandchildIssueIds.push(grandchildNode.data.issue_id);
				}
			}
			if (!missingGrandchildIssueIds.length) continue;

			for (const parentStateId of completelyRestrictedStateIds) {
				violations.push({
					edgeId: edge.id,
					parentStateId,
					rule: 'missingGrandchildEdges',
					missingGrandchildIssueIds,
				});
			}
		}
	}

	return {
		uncertaintyParentRestriction: [...uncertaintyParentRestrictionIssueIds],
		missingGrandchildEdges: [...missingGrandchildEdgeIssueIds],
		violations,
	};
};

export const applyRestrictionEntry = (
	restrictionTables: RestrictionTable[],
	updatedEntry: RestrictionEntry,
): RestrictionTable[] =>
	restrictionTables.map(table =>
		table.id === updatedEntry.restriction_table_id
			? {
					...table,
					restriction_entries: table.restriction_entries.map(entry =>
						entry.id === updatedEntry.id ? updatedEntry : entry,
					),
				}
			: table,
	);
