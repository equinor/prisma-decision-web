import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { User } from '../../validators';
import { showErrorToast } from '../../components/ShowToast';

export const useSearchUsers = (debouncedSearchTerm: string) => {
	const { data: users = [] } = useQuery({
		queryKey: ['graphUsers', debouncedSearchTerm],
		queryFn: async () => {
			try {
				const [graphUsersResponse, prismaUsersResponse] = await Promise.all([
					apiClient.get<User[]>(`/users/search?query=${debouncedSearchTerm}`),
					apiClient.get<User[]>('/users'),
				]);
				const combinedUsers = graphUsersResponse.data.map(graphUser => {
					const matchingPrismaUser = prismaUsersResponse.data.find(
						prismaUser => prismaUser.user_id === graphUser.user_id,
					);
					return {
						...graphUser,
						hasAccess: !!matchingPrismaUser,
					};
				});
				return combinedUsers;
			} catch {
				showErrorToast('Failed to search users');
				return [];
			}
		},
		enabled: !!debouncedSearchTerm.trim(),
	});

	const hasActiveSearch = debouncedSearchTerm.trim().length > 0;

	return {
		users,
		hasActiveSearch,
	};
};
