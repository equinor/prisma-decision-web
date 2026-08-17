import { getOutgoers, Node, Edge as ReactFlowEdge } from '@xyflow/react';
import {
	Edge as InfluenceEdge,
	InfluenceNode as InfluenceNodeType,
	Issue,
	ProbabilityTable,
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
