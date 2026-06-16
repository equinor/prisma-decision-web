export const isProd = () => import.meta.env.PROD === true || import.meta.env.MODE === 'production';
