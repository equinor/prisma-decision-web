import { Configuration, PublicClientApplication } from '@azure/msal-browser';

const REDIRECT_URI = import.meta.env.VITE_APP_REDIRECT_URI;
const CLIENT_ID = import.meta.env.VITE_APP_CLIENT_ID;

export const msalConfig: Configuration = {
	auth: {
		clientId: CLIENT_ID,
		authority: 'https://login.microsoftonline.com/3aa4a235-b6e2-48d5-9195-7fcf05b459b0', // This is a URL (e.g. https://login.microsoftonline.com/{your tenant ID})
		redirectUri: REDIRECT_URI,
	},
	cache: {
		cacheLocation: 'localStorage', // This configures where your cache will be stored
	},
};

export const scopes = [import.meta.env.VITE_APP_PRISMA_API_SCOPE];

export const msalInstance = new PublicClientApplication(msalConfig);
export const initializeMsalAuth = async () => {
	await msalInstance.initialize?.();

	const response = await msalInstance.handleRedirectPromise();
	if (response) return;

	const account = msalInstance.getAllAccounts()[0];
	if (!account) {
		await msalInstance.loginRedirect({
			scopes,
		});
	}

	await msalInstance
		.acquireTokenSilent({
			scopes: scopes,
			account: account,
		})
		.catch(async () => {
			await msalInstance.acquireTokenRedirect({
				scopes: scopes,
			});
		});
};

export const initializePublicAuth = async () => {
	const user = localStorage.getItem('username');
	if (user) return;
	const username = prompt('Enter your username:');
	if (username) localStorage.setItem('username', username);
};
