/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_APP_CLIENT_ID: string;
	readonly VITE_APP_REDIRECT_URI: string;
	readonly VITE_APP_PRISMA_API: string;
	readonly VITE_APP_PRISMA_API_SCOPE: string;
}
interface ImportMeta {
	readonly env: ImportMetaEnv;
}
