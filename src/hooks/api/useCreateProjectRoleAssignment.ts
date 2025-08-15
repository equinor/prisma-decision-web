import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { RoleAssignment } from '../../validators';

export const useCreateRoleAssignment = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (roleAssignment: RoleAssignment) => {
			const res = await apiClient.post<RoleAssignment>('/assign-roles', roleAssignment);
			return res.data;
		},
		onSuccess: () => {
			queryClient.refetchQueries({ queryKey: ['project'] });
		},
	});
};
