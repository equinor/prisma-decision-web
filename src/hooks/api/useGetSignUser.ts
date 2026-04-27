import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { User } from '../../validators';

export const useGetSignUser = () => {
	const { data: signuser } = useQuery({
		queryKey: ['signuser'],
		queryFn: async () => {
			const res = await apiClient.get<User>('user/me');
			return res.data;
		},
	});

	return {
		signuser,
	};
};
