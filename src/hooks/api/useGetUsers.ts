import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { User } from '../../validators';

export const useGetUsers = () => {
	const { data = [], ...rest } = useQuery({
		queryKey: ['users'],
		queryFn: async () => {
			const res = await apiClient.get<User[]>('/users');
			return res.data;
		},
	});

	return {
		users: data,
		...rest,
	};
};
