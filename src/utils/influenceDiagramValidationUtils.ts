import { getOutgoers, Node, Edge as ReactFlowEdge } from '@xyflow/react';
import {
	decisionTypes,
	InfluenceNode as InfluenceNodeType,
	Issue,
	issueTypes,
	ProbabilityTable,
} from '../validators';
import { hasInvalidProbabilitySum } from './getDiscreteProbabiltyRows';

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

		return hasInvalidProbabilitySum(pt.discrete_probabilities, issues);
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
): boolean => {
	const nodeIssueIds = new Set(nodes.map(n => n.data.issue_id));
	const nodeIssues = issues.filter(i => nodeIssueIds.has(i.id));
	return getIssuesWithInvalidProbabilityTable(nodeIssues, probabilityTables).length > 0;
};

export const hasLoops = (
	nodes: Node<InfluenceNodeType>[],
	edges: ReactFlowEdge[],
	issues: Issue[],
): boolean => {
	const filteredNodes = getNodesInOrOnBoundary(nodes, issues);
	const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
	const filteredEdges = edges.filter(
		e => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target),
	);
	return getEdgesInCycle(filteredNodes, filteredEdges).size > 0;
};

export const hasIssues = (nodes: Node<InfluenceNodeType>[], issues: Issue[]): boolean => {
	return getNodesInOrOnBoundary(nodes, issues).length > 0;
};

export const hasMissingEdges = (edges: { length: number }): boolean => {
	return edges.length === 0;
};

export const hasOptionsMissing = (nodes: Node<InfluenceNodeType>[], issues: Issue[]): boolean => {
	const filteredNodes = getNodesInOrOnBoundary(nodes, issues);
	return filteredNodes.some(node => {
		const issue = issues.find(i => i.id === node.data.issue_id);

		return (
			issue?.type === issueTypes[1] &&
			issue.decision.type === decisionTypes[1] &&
			issue.decision?.options?.length === 0
		);
	});
};

export const hasOutcomesMissing = (nodes: Node<InfluenceNodeType>[], issues: Issue[]): boolean => {
	const filteredNodes = getNodesInOrOnBoundary(nodes, issues);
	return filteredNodes.some(node => {
		const issue = issues.find(i => i.id === node.data.issue_id);
		return (
			issue?.type === issueTypes[2] &&
			issue.uncertainty.is_key &&
			issue.uncertainty?.outcomes?.length === 0
		);
	});
};
