import { getOutgoers, Node, Edge as ReactFlowEdge } from '@xyflow/react';

import { InfluenceNode as InfluenceNodeType, Issue } from '../validators';
import { hasInvalidProbabilitySum } from './getDiscreteProbabiltyRows';

export const getIssuesWithInvalidProbabilityTable = (issues: Issue[]): Issue[] => {
	return issues.filter(i => {
		const isUncertainty = i.type === 'Uncertainty';
		const hasDiscreteProbability = i.uncertainty?.discrete_probabilities?.length > 0;
		if (!isUncertainty || !hasDiscreteProbability) return false;

		return hasInvalidProbabilitySum(i.uncertainty.discrete_probabilities, issues);
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
): boolean => {
	const nodeIssueIds = new Set(nodes.map(n => n.data.issue_id));
	const nodeIssues = issues.filter(i => nodeIssueIds.has(i.id));
	return getIssuesWithInvalidProbabilityTable(nodeIssues).length > 0;
};

export const hasLoops = (nodes: Node[], edges: ReactFlowEdge[]): boolean => {
	return getEdgesInCycle(nodes, edges).size > 0;
};

export const hasIssues = (nodes: Node<InfluenceNodeType>[]): boolean => {
	return nodes.length > 0;
};

export const hasMissingEdges = (edges: { length: number }): boolean => {
	return edges.length === 0;
};

export const hasOptionsMissing = (nodes: Node<InfluenceNodeType>[], issues: Issue[]): boolean => {
	return nodes.some(node => {
		const issue = issues.find(i => i.id === node.data.issue_id);
		return issue?.type === 'Decision' && issue.decision?.options?.length === 0;
	});
};

export const hasOutcomesMissing = (nodes: Node<InfluenceNodeType>[], issues: Issue[]): boolean => {
	return nodes.some(node => {
		const issue = issues.find(i => i.id === node.data.issue_id);
		return issue?.type === 'Uncertainty' && issue.uncertainty?.outcomes?.length === 0;
	});
};
