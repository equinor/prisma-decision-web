export const isDev = () => import.meta.env.MODE === 'dev';
export const isProd = () => import.meta.env.PROD;
export const isTest = () => import.meta.env.MODE === 'test';
