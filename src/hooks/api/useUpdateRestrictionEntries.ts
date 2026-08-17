import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { showErrorToast } from '../../components/ShowToast';
import { RestrictionEntry, RestrictionTable } from '../../validators';

export const useUpdateRestrictionEntries = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (entry: RestrictionEntry) => {
			const res = await apiClient.put('/restriction_entries', [entry]);
			return res.data[0];
		},
		onMutate: (updatedEntry: RestrictionEntry) => {
			queryClient.cancelQueries({ queryKey: ['restrictionTables'] });
			const previousTables = queryClient.getQueryData<RestrictionTable[]>([
				'restrictionTables',
			]);

			if (previousTables) {
				queryClient.setQueryData(
					['restrictionTables'],
					previousTables.map(table =>
						table.id === updatedEntry.restriction_table_id
							? {
									...table,
									restriction_entries: table.restriction_entries.map(entry =>
										entry.id === updatedEntry.id ? updatedEntry : entry,
									),
								}
							: table,
					),
				);
			}

			return { previousTables };
		},
		onError: (_err, _updatedEntry, context) => {
			showErrorToast('Failed to update restriction');
			if (context?.previousTables) {
				queryClient.setQueryData(['restrictionTables'], context.previousTables);
			}
			queryClient.invalidateQueries({ queryKey: ['restrictionTables'] });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['decisionTree'] });
			queryClient.invalidateQueries({ queryKey: ['solution'] });
			queryClient.invalidateQueries({ queryKey: ['restrictionTables'] });
			queryClient.invalidateQueries({ queryKey: ['influenceDiagramErrors'] });
		},
	});
};
