import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { initializeAuth, msalInstance } from './auth/config.ts';
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { showErrorToast } from './components/ShowToast.tsx';

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

initializeAuth(msalInstance).then(() => {
	return createRoot(document.getElementById('root')!).render(
		<StrictMode>
			<QueryClientProvider client={queryClient}>
				<App />
			</QueryClientProvider>
		</StrictMode>,
	);
});
