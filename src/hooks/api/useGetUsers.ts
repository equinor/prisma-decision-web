import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { User } from '../../validators';

export const useGetUsers = () => {
	const { data = [], ...rest } = useQuery({
		queryKey: ['users'],
		queryFn: async (): Promise<User[]> => {
			const res = await apiClient.get<UserResponse[]>('/users');
			return res.data.map(user => ({
				user_id: user.user_id,
				name: user.name,
				azure_id: user.azure_id,
			}));
		},
	});

	return {
		users: data,
		...rest,
	};
};

type UserResponse = {
	user_id: number;
	name: string;
	azure_id: string;
};
