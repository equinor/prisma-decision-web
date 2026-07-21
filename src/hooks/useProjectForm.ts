import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { Project, projectSchema } from '../validators';
import { useCreateProject } from './api/useCreateProject';
import { useUpdateProject } from './api/useUpdateProject';

const getDefaultValues = (): Project => ({
	name: '',
	opportunity_statement: '',
	public: false,
	end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
	id: crypto.randomUUID(),
	parent_project_id: null,
	users: [],
});

export const useProjectFormContext = () => useFormContext<Project>();
export const useProjectForm = (project?: Project) => {
	const { mutate: createProject, isPending: isPendingCreate } = useCreateProject();
	const { mutate: updateProject, isPending: isPendingUpdate } = useUpdateProject();

	const formDefaults = useMemo(() => {
		// Use selectedProject if available, otherwise use fresh defaults
		return project || getDefaultValues();
	}, [project]);

	const formMethods = useForm({
		resolver: zodResolver(projectSchema),
		values: formDefaults,
	});

	const handleSubmit = formMethods.handleSubmit(
		data => {
			const mutation = project ? updateProject : createProject;
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
