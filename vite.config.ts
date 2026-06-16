import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import checker from 'vite-plugin-checker';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		babel({
			presets: [reactCompilerPreset()],
		}),
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
	build: {
		rollupOptions: {
			input: {
				main: 'index.html',
				login: 'login.html',
			},
		},
	},
});
