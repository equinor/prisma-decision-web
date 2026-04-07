export const isDev = () => import.meta.env.DEV === true || import.meta.env.MODE === 'development';
export const isProd = () => import.meta.env.PROD === true || import.meta.env.MODE === 'production';
export const isTest = () => import.meta.env.TEST === true || import.meta.env.MODE === 'test';
