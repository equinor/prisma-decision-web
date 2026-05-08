import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { User } from '../../validators';
import { showErrorToast } from '../../components/ShowToast';

export const useGetSignUser = () => {
	const { data: signuser } = useQuery({
		queryKey: ['signuser'],
		queryFn: async () => {
			try {
				const res = await apiClient.get<User>('user/me');
				return res.data;
			} catch {
				showErrorToast('Failed to fetch user info');
			}
		},
	});

	return {
		signuser,
	};
};
