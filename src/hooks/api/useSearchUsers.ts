import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { apiClient } from '../../api';
import { User } from '../../validators';

export const useSearchUsers = (debouncedSearchTerm: string, users: User[]) => {
	// Filter local users
	const filteredUsers = useMemo(() => {
		if (!debouncedSearchTerm.trim()) return [];
		return users.filter(user =>
			user.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
		);
	}, [debouncedSearchTerm, users]);

	// Fetch graph users
	const { data: graphUsers = [] } = useQuery({
		queryKey: ['graphUsers', debouncedSearchTerm],
		queryFn: async () => {
			if (!debouncedSearchTerm.trim()) return [];
			const res = await apiClient.get<User[]>(`/graph/users?search=${debouncedSearchTerm}`);
			return res.data;
		},
		enabled: debouncedSearchTerm.trim().length > 0,
	});

	const hasActiveSearch = debouncedSearchTerm.trim().length > 0;

	return {
		filteredUsers,
		graphUsers,
		hasActiveSearch,
	};
};
