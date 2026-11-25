import axios from 'axios';
import { authConfig } from './api';

// Deployed environments set the Radix URL of prisma-decision-ai; otherwise the Vite dev proxy is used.
const AI_API_URL: string = import.meta.env.VITE_APP_PRISMA_AI_URL || '/ai-api';

// Sends the same access token as apiClient, which prisma-decision-ai validates.
export const aiClient = axios.create({ baseURL: AI_API_URL });

aiClient.interceptors.request.use(
	authConfig[import.meta.env.MODE as keyof typeof authConfig].interceptor,
);
