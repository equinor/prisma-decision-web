import { Node, useConnection } from '@xyflow/react';
import { useSelectedProjectIssues } from '../../../hooks/useSelectedProjectIssues';
import { InfluenceNode as InfluenceNodeType } from '../../../validators';

export const useInfluenceNodeCommon = (id: string, issueId: string) => {
	const issue = useSelectedProjectIssues().find(currentIssue => currentIssue.id === issueId);
	const { inProgress, isTarget } = useConnection<
		Node<InfluenceNodeType>,
		{ inProgress: boolean; isTarget: boolean }
	>(connection => ({
		inProgress: connection.inProgress,
		isTarget: connection.inProgress && connection.fromNode?.id !== id,
	}));

	return {
		issue,
		inProgress,
		isTarget,
	};
};
