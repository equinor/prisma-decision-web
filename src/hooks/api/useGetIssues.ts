import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Issue } from '../../validators';
import { convertToNodes } from '../../utils/convertToNodes';
import { Node } from '@xyflow/react';

export const useGetIssues = () => {
	const { data = [], ...rest } = useQuery({
		queryKey: ['issues'],
		queryFn: async () => {
			const res = await apiClient.get<Issue[]>('/issues');

			return res.data;
		},
	});

	return {
		issues: data,
		...rest,
	};
};

const defaultValue: Node<{ issue: Issue }>[] = [];
export const useGetNodes = () => {
	const { data = defaultValue, ...rest } = useQuery({
		queryKey: ['nodes'],

		queryFn: async () => {
			const res = await apiClient.get<Issue[]>('/issues');
			return convertToNodes(res.data);
		},
	});

	return {
		nodes: data,
		...rest,
	};
};
