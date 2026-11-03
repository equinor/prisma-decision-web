import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'jsdom',
		setupFiles: ['./src/test/setup.ts'],
		// Keep concurrent jsdom/EDS renders from starving interaction tests of CPU time.
		maxWorkers: 2,
	},
});
