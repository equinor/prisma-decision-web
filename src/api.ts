import axios, { InternalAxiosRequestConfig } from 'axios';
import { msalInstance, scopes } from './auth/config';
import { isPublic } from './utils/getEnvironment';

export const apiClient = axios.create({
	baseURL: import.meta.env.VITE_APP_PRISMA_API_URL,
	headers: {
		'Content-Type': 'application/json',
	},
});

export const msalInterceptor = (config: InternalAxiosRequestConfig) => {
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
};

export const publicInterceptor = (config: InternalAxiosRequestConfig) => {
	const username = localStorage.getItem('username');
	if (username) {
		config.headers['X-Username'] = username;
	}
	return config;
};

// Optional: request/response interceptors
apiClient.interceptors.request.use(isPublic() ? publicInterceptor : publicInterceptor);
