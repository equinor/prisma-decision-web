import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import checker from 'vite-plugin-checker';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		checker({
			typescript: {
				tsconfigPath: './tsconfig.app.json',
			},
			eslint: { lintCommand: 'eslint "./src/**/*.{ts,tsx}"', useFlatConfig: true },
			overlay: { initialIsOpen: false },
		}),
	],
	server: {
		port: 5004,
	},
});
