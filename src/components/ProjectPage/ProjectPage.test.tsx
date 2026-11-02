import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { expect, test } from 'vitest';
import { ProjectPage } from './ProjectPage';

test('shows a message when the project in the URL is unavailable', () => {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false, staleTime: Infinity } },
	});
	queryClient.setQueryData(['projects'], []);
	queryClient.setQueryData(['issues'], []);
	queryClient.setQueryData(['edges'], []);
	queryClient.setQueryData(['nodes'], []);

	render(
		<QueryClientProvider client={queryClient}>
			<MemoryRouter initialEntries={['/project/missing-project']}>
				<Routes>
					<Route path='/project/:projectId' element={<ProjectPage />} />
				</Routes>
			</MemoryRouter>
		</QueryClientProvider>,
	);

	expect(screen.getByRole('heading', { name: 'Project not found' })).toBeVisible();
	expect(
		screen.getByText('The project may have been deleted or you may not have access to it.'),
	).toBeVisible();
	expect(screen.getByRole('link', { name: 'Back to projects' })).toHaveAttribute('href', '/');
});
