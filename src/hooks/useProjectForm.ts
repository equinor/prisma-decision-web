import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFormContext } from 'react-hook-form';
import { useMemo } from 'react';
import { Project, projectSchema } from '../validators';
import { useSelectedProject } from './useSelectedProject';
import { useCreateProject } from './api/useCreateProject';
import { useUpdateProject } from './api/useUpdateProject';

export const useProjectFormContext = () => useFormContext<Project>();
export const useProjectForm = () => {
	const selectedProject = useSelectedProject();
	const { mutate: createProject, isPending: isPendingCreate } = useCreateProject();
	const { mutate: updateProject, isPending: isPendingUpdate } = useUpdateProject();

	const formDefaults = useMemo(() => {
		// Use selectedProject if available, otherwise use fresh defaults
		return selectedProject || getDefaultValues();
	}, [selectedProject]);

	const formMethods = useForm({
		resolver: zodResolver(projectSchema),
		values: formDefaults,
	});

	const handleSubmit = formMethods.handleSubmit(
		data => {
			const mutation = selectedProject ? updateProject : createProject;
			mutation(data);
		},
		errors => {
			// eslint-disable-next-line no-console
			console.error('Form errors:', errors);
		},
	);

	return {
		formMethods,
		handleSubmit,
		isPending: isPendingCreate || isPendingUpdate,
	};
};

const getDefaultValues = (): Project => ({
	name: '',
	opportunity_statement: '',
	public: false,
	end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
	objectives: [],
	id: crypto.randomUUID(),
	parent_project_id: null,
	users: [],
	strategies: [],
});
