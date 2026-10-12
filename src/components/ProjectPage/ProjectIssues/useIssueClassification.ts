import { useIsMutating } from '@tanstack/react-query';
import { useUpdateIssuesOptimistic } from '../../../hooks/api/useUpdateIssues';
import { Issue } from '../../../validators';

export const useIssueClassification = (issue: Issue) => {
	const mutationKey = ['issueClassification', issue.id];
	const pending = useIsMutating({ mutationKey }) > 0;
	const { mutate } = useUpdateIssuesOptimistic({
		mutationKey,
		errorMessage: 'Failed to update issue',
	});

	const save = (updated: Issue) => mutate([updated]);

	return {
		pending,
		changeType: (type: Issue['type']) => save({ ...issue, type }),
		changeDecisionType: (type: Issue['decision']['type']) =>
			save({ ...issue, decision: { ...issue.decision, type } }),
		changeBoundary: (boundary: Issue['boundary']) => save({ ...issue, boundary }),
		toggleKey: () =>
			save({
				...issue,
				uncertainty: { ...issue.uncertainty, is_key: !issue.uncertainty.is_key },
			}),
	};
};
