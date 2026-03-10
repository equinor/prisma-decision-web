import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { User } from '../../validators';

export const useSearchUsers = (debouncedSearchTerm: string) => {
	// Fetch graph users
	const { data: users = [] } = useQuery({
		queryKey: ['graphUsers', debouncedSearchTerm],
		queryFn: async () => {
			if (!debouncedSearchTerm.trim()) return [];
			const [graphUsersResponse, prismaUsersResponse] = await Promise.all([
				apiClient.get<User[]>(`/graph/users?search=${debouncedSearchTerm}`),
				apiClient.get<User[]>('/users'),
			]);
			const prismaUsers = prismaUsersResponse.data.map(({ user_id, name, azure_id }) => ({
				user_id,
				name,
				azure_id,
			}));

			const graphUsers = graphUsersResponse.data.map(({ name, azure_id }) => ({
				name,
				azure_id,
			}));

			const combinedUsers = graphUsers.map(graphUser => {
				const matchingPrismaUser = prismaUsers.find(
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
		enabled: debouncedSearchTerm.trim().length > 0,
	});

	const hasActiveSearch = debouncedSearchTerm.trim().length > 0;

	return {
		users,
		hasActiveSearch,
	};
};
