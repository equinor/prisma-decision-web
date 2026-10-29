import { useUpdateIssuesOptimistic } from './api/useUpdateIssues';
import { Issue } from '../validators';

export const useIssueClassification = (issue: Issue) => {
	const { mutate } = useUpdateIssuesOptimistic({
		errorMessage: 'Failed to update issue',
	});

	const save = (updated: Issue) => mutate([updated]);

	return {
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
