import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { showErrorToast } from './components/ShowToast.tsx';
import './index.css';
import { authConfig } from './api.ts';

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5,
		},
	},
	queryCache: new QueryCache({
		onError: (error, query) => {
			if (query.meta?.errorMessage) {
				showErrorToast(query.meta.errorMessage as string);
			} else {
				showErrorToast((error as Error).message);
			}
		},
	}),
});

const env = import.meta.env.MODE as keyof typeof authConfig;

authConfig[env].initialize().then(() => {
	return createRoot(document.getElementById('root')!).render(
		<StrictMode>
			<QueryClientProvider client={queryClient}>
				<App />
			</QueryClientProvider>
		</StrictMode>,
	);
});
