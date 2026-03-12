import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { User } from '../../validators';

export const useSearchUsers = (debouncedSearchTerm: string) => {
	const { data: users = [] } = useQuery({
		queryKey: ['graphUsers', debouncedSearchTerm],
		queryFn: async () => {
			const [graphUsersResponse, prismaUsersResponse] = await Promise.all([
				apiClient.get<User[]>(`/graph/users?search=${debouncedSearchTerm}`),
				apiClient.get<User[]>('/users'),
			]);
			const combinedUsers = graphUsersResponse.data.map(graphUser => {
				const matchingPrismaUser = prismaUsersResponse.data.find(
					prismaUser => prismaUser.azure_id === graphUser.azure_id,
				);
				return {
					...graphUser,
					user_id: matchingPrismaUser ? matchingPrismaUser.user_id : null,
					hasAccess: !!matchingPrismaUser,
				};
			});
			return combinedUsers;
		},
		enabled: !!debouncedSearchTerm.trim(),
	});

	const hasActiveSearch = debouncedSearchTerm.trim().length > 0;

	return {
		users,
		hasActiveSearch,
	};
};
