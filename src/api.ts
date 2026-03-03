import axios from 'axios';
import { msalInstance, scopes } from './auth/config';

export const apiClient = axios.create({
	baseURL: import.meta.env.VITE_APP_PRISMA_API_URL,
	headers: {
		'Content-Type': 'application/json',
	},
});

// Optional: request/response interceptors
apiClient.interceptors.request.use(config => {
	// Example: attach token
	return msalInstance
		.acquireTokenSilent({
			account: msalInstance.getAllAccounts()[0],
			scopes,
		})
		.then(async token => {
			config.headers.authorization = `Bearer ${token.accessToken}`;
			return config;
		})
		.catch(
			async () =>
				msalInstance.acquireTokenRedirect({
					scopes: scopes,
				}) as never,
		);
});
