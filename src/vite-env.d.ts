/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_APP_CLIENT_ID: string;
	readonly VITE_APP_REDIRECT_URI: string;
	readonly VITE_APP_DOT_API: string;
	readonly VITE_APP_DOT_API_SCOPE: string;
}
interface ImportMeta {
	readonly env: ImportMetaEnv;
}
