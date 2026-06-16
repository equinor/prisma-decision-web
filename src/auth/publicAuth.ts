import { InternalAxiosRequestConfig } from 'axios';

export const initializePublicAuth = async () => {
	if (localStorage.getItem('username')) return;
	window.location.href = '/login.html';
};

export const publicInterceptor = (config: InternalAxiosRequestConfig) => {
	const username = localStorage.getItem('username');
	if (username) {
		config.headers['X-Username'] = username;
	}
	return config;
};
