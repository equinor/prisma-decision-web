import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { RestrictionTable } from '../../validators';

export const useCreateRestrictionTables = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: Partial<RestrictionTable>) => {
			const res = await apiClient.post('/restriction_tables', [data]);
			return res.data[0];
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['restrictionTables'],
			});
		},
	});
};
