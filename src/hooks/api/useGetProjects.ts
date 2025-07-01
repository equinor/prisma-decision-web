import { useQuery } from '@tanstack/react-query';
import { msalInstance, scopes } from '../../auth/config';

export const useGetProjects = () => {
	const { data = [] } = useQuery({
		queryKey: ['projects'],
		queryFn: async () => {
			msalInstance
				.acquireTokenSilent({
					account: msalInstance.getAllAccounts()[0],
					scopes,
				})
				.then(async token => {
					const res = await fetch(
						`${import.meta.env.VITE_APP_DOT_API_URL}/projects-populated`,
						{
							headers: {
								authorization: `Bearer ${token.accessToken}`,
							},
						},
					);
					return await res.json();
				});
		},
	});

	return data;
};
