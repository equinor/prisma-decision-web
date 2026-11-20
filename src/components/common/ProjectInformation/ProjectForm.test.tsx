import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosAdapter } from 'axios';
import { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '../../../api';
import { project } from '../../../test/issueFixtures';
import { Project } from '../../../validators';
import { ProjectContext } from '../../ProjectPage/ProjectContext';
import { CreateProject } from './CreateProject';
import { ProjectForm } from './ProjectForm';

let savedRequests: { method: string; url: string | undefined; projects: Project[] }[];

const adapter: AxiosAdapter = async config => {
	const projects: Project[] = JSON.parse(config.data ?? '[]');
	if (config.method === 'put' || config.method === 'post') {
		savedRequests.push({ method: config.method, url: config.url, projects });
	}
	return {
		config,
		status: 200,
		statusText: 'OK',
		headers: {},
		data: projects,
	};
};

const renderForm = (children: ReactNode = <ProjectForm />) => {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	queryClient.setQueryData(['projects'], [project]);
	return render(
		<QueryClientProvider client={queryClient}>
			<MemoryRouter>
				<ProjectContext value={project}>{children}</ProjectContext>
			</MemoryRouter>
		</QueryClientProvider>,
	);
};

beforeEach(() => {
	savedRequests = [];
	apiClient.interceptors.request.clear();
	apiClient.defaults.adapter = adapter;
});

describe('project name editing', () => {
	it.each(['Enter', 'click away'])('saves the renamed project once on %s', async action => {
		const user = userEvent.setup();
		renderForm();
		const name = screen.getByRole('textbox', { name: 'Project Name' });
		await user.clear(name);
		await user.type(name, 'Renamed project');
		expect(savedRequests).toHaveLength(0);

		if (action === 'Enter') {
			await user.keyboard('{Enter}');
		} else {
			await user.click(screen.getByRole('heading', { name: 'Project Information' }));
		}

		await waitFor(() => expect(savedRequests).toHaveLength(1));
		expect(savedRequests[0]).toEqual({
			method: 'put',
			url: '/projects',
			projects: [{ ...project, name: 'Renamed project' }],
		});
		expect(name).not.toHaveFocus();
		await user.click(screen.getByRole('heading', { name: 'Project Information' }));
		expect(savedRequests).toHaveLength(1);
	});

	it.each(['Shift', 'Control', 'Meta'])(
		'does not confirm the name with %s+Enter',
		async modifier => {
			const user = userEvent.setup();
			renderForm();
			const name = screen.getByRole('textbox', { name: 'Project Name' });
			await user.clear(name);
			await user.type(name, 'Renamed project');

			await user.keyboard(`{${modifier}>}{Enter}{/${modifier}}`);

			expect(name).toHaveFocus();
			expect(savedRequests).toHaveLength(0);
			await user.keyboard('{Enter}');
			await waitFor(() => expect(savedRequests).toHaveLength(1));
		},
	);

	it('does not handle Enter outside the project name field', async () => {
		const user = userEvent.setup();
		renderForm();
		const search = screen.getByRole('textbox', { name: 'Search users' });
		await user.click(search);
		await user.keyboard('{Enter}');

		expect(search).toHaveFocus();
		expect(savedRequests).toHaveLength(0);
	});

	it('validates the name before saving with Enter', async () => {
		const user = userEvent.setup();
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
		try {
			renderForm();
			await user.clear(screen.getByRole('textbox', { name: 'Project Name' }));
			await user.keyboard('{Enter}');

			expect(await screen.findByText('Name is required')).toBeInTheDocument();
			expect(screen.getByRole('textbox', { name: 'Project Name' })).toHaveFocus();
			expect(savedRequests).toHaveLength(0);
		} finally {
			consoleError.mockRestore();
		}
	});

	it('preserves Enter submission when creating a project', async () => {
		const user = userEvent.setup();
		renderForm(<CreateProject />);
		await user.click(screen.getByRole('button', { name: 'Create Project' }));
		await user.type(
			screen.getByRole('textbox', { name: 'Project Name' }),
			'New project{Enter}',
		);

		await waitFor(() => expect(savedRequests).toHaveLength(1));
		expect(savedRequests[0]).toMatchObject({
			method: 'post',
			url: '/projects',
			projects: [{ name: 'New project' }],
		});
	});
});
