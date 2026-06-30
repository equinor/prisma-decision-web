import { InternalAxiosRequestConfig } from 'axios';

export const initializeResearchAuth = async () => {
	if (localStorage.getItem('username')) return;
	window.location.href = '/login.html';
};

export const researchInterceptor = (config: InternalAxiosRequestConfig) => {
	const username = localStorage.getItem('username');
	if (username) {
		config.headers['X-Username'] = username;
	}
	return config;
};
