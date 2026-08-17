import axios from 'axios';
import { initializeMsalAuth, msalInterceptor } from './auth/msalAuth';
import { initializePublicAuth, publicInterceptor } from './auth/publicAuth';

export const authConfig = {
	public: {
		initialize: initializePublicAuth,
		interceptor: publicInterceptor,
	},
	research: {
		initialize: initializePublicAuth,
		interceptor: publicInterceptor,
	},
	development: {
		initialize: initializeMsalAuth,
		interceptor: msalInterceptor,
	},
	production: {
		initialize: initializeMsalAuth,
		interceptor: msalInterceptor,
	},
	test: {
		initialize: initializeMsalAuth,
		interceptor: msalInterceptor,
	},
};

export const apiClient = axios.create({
	baseURL: import.meta.env.VITE_APP_PRISMA_API_URL,
	headers: {
		'Content-Type': 'application/json',
	},
});

// Optional: request/response interceptors
apiClient.interceptors.request.use(
	authConfig[import.meta.env.MODE as keyof typeof authConfig].interceptor,
);
