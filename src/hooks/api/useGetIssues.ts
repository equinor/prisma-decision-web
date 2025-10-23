import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { InfluenceParentNode } from '../../components/ProjectPage/InfluenceDiagram/types';
import { convertToInfluenceNodes } from '../../utils/convertToInfluenceNodes';
import { Issue } from '../../validators';

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

const defaultValue: InfluenceParentNode[] = [];
export const useGetNodes = () => {
	const { data = defaultValue, ...rest } = useQuery({
		queryKey: ['nodes'],

		queryFn: async () => {
			const res = await apiClient.get<Issue[]>('/issues');
			return convertToInfluenceNodes(res.data);
		},
	});

	return {
		nodes: data,
		...rest,
	};
};
