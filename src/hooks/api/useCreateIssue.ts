import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Issue } from '../../validators';
import { showErrorToast } from '../../components/ShowToast';
import { getNextIssuePosition } from '../../utils/getNextIssuePosition';
import { issueMutationScope } from './useUpdateIssues';

export const useCreateIssue = ({
	onSuccess,
	position,
}: {
	onSuccess?: () => void;
	position?: 'top' | 'bottom';
}) => {
	const queryClient = useQueryClient();
	return useMutation({
		scope: issueMutationScope,
		mutationFn: async (issue: Issue) => {
			let createdIssue = issue;
			if (position) {
				const projectIssues = (queryClient.getQueryData<Issue[]>(['issues']) ?? []).filter(
					current => current.project_id === issue.project_id,
				);
				const columnIssues = projectIssues
					.filter(current => current.type === issue.type)
					.sort((first, second) => first.order - second.order);
				if (position === 'top' && columnIssues.some(current => current.order === 0)) {
					await apiClient.put(
						'/issues',
						columnIssues.map((current, index) => ({ ...current, order: index + 1 })),
					);
				}
				const { x, y } = getNextIssuePosition(projectIssues);
				createdIssue = {
					...issue,
					order:
						position === 'top'
							? 0
							: Math.max(0, ...columnIssues.map(current => current.order)) + 1,
					node: {
						...issue.node,
						node_style: { ...issue.node.node_style, x_position: x, y_position: y },
					},
				};
			}
			const res = await apiClient.post('/issues', [createdIssue]);
			return res.data[0];
		},
		onSuccess: async () => {
			await queryClient.refetchQueries({ queryKey: ['issues'] });
			await queryClient.refetchQueries({ queryKey: ['nodes'] });
			onSuccess?.();
		},
		onError: () => {
			if (position) queryClient.invalidateQueries({ queryKey: ['issues'] });
			showErrorToast('Failed to create issue');
		},
	});
};
