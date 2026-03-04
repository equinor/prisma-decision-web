import { Edge, Node, Position } from '@xyflow/react';
import { getIssueBranches } from './getIssueBranches';
import { Issue } from '../validators';

export const buildEdgesForNodeBranches = (issueNodes: Node<IssueNodeData>[]) => {
	const nodes: Node[] = [];
	const edges: Edge[] = [];

	issueNodes.forEach(node => {
		const branches = getIssueBranches(node.data.issue);
		if (branches.length === 0) return;

		const branchSpacing = 100;
		const branchXOffset = 490;
		const verticalOffset = ((branches.length - 1) * branchSpacing) / 2;

		branches.forEach((branch, branchIndex) => {
			const branchNodeId = `${node.id}-branch-${branch.id}`;
			nodes.push({
				id: branchNodeId,
				position: {
					x: node.position.x + branchXOffset,
					y: node.position.y + 40 + branchIndex * branchSpacing - verticalOffset,
				},
				sourcePosition: Position.Right,
				targetPosition: Position.Left,
				data: {},
				style: {
					width: 2,
					height: 2,
					padding: 0,
					border: 'none',
					background: 'transparent',
					opacity: 0,
				},
				draggable: false,
				deletable: false,
				selectable: false,
			});

			edges.push({
				id: `e${node.id}-${branchNodeId}`,
				source: node.id,
				sourceHandle: Position.Right,
				target: branchNodeId,
				type: 'compactTreeEdge',
				data: {
					probability: branch.probability,
					utility: branch.utility,
					outcomeName: branch.name,
				},
			});
		});
	});

	return { nodes, edges };
};

type IssueNodeData = {
	issue: Issue;
};
