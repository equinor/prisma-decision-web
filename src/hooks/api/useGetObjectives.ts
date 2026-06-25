import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Objective } from '../../validators';
const defaultObjectives: Objective[] = [];

export const useGetObjectives = () => {
	const { data: objectives = defaultObjectives, ...rest } = useQuery({
		queryKey: ['objectives'],
		queryFn: async () => {
			const res = await apiClient.get<Objective[]>('/objectives');
			return res.data;
		},
		meta: {
			errorMessage: 'Failed to fetch objectives',
		},
	});
	return {
		objectives,
		...rest,
	};
};
