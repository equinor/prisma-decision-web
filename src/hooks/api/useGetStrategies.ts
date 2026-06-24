import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Strategy } from '../../validators';

const defaultStrategies: Strategy[] = [];

export const useGetStrategies = () => {
	const { data: strategies = defaultStrategies, ...rest } = useQuery({
		queryKey: ['strategies'],
		queryFn: async () => {
			const res = await apiClient.get<Strategy[]>('/strategies');
			return res.data;
		},
		meta: {
			errorMessage: 'Failed to fetch strategies',
		},
	});
	return {
		strategies,
		...rest,
	};
};
