import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { RestrictionTable } from '../../validators';
const defaultValue: RestrictionTable[] = [];

export const useGetRestrictionTables = () => {
	const { data: restrictionTables = defaultValue, ...rest } = useQuery({
		queryKey: ['restrictionTables'],
		queryFn: async () => {
			const res = await apiClient.get<RestrictionTable[]>('/restriction_tables');
			return res.data;
		},
		meta: {
			errorMessage: 'Failed to fetch restriction tables',
		},
	});
	return {
		restrictionTables,
		...rest,
	};
};
