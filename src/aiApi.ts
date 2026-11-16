// Deployed environments set the Radix URL of prisma-decision-ai; otherwise the Vite dev proxy is used.
export const AI_API_URL: string = import.meta.env.VITE_APP_PRISMA_AI_URL || '/ai-api';
