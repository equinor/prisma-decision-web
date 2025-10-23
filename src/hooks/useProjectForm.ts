import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFormContext } from 'react-hook-form';
import { Project, projectSchema } from '../validators';
import { useSelectedProject } from './useSelectedProject';
import { useCreateProject } from './api/useCreateProject';
import { useUpdateProject } from './api/useUpdateProject';

export const useProjectFormContext = () => useFormContext<Project>();
export const useProjectForm = () => {
	const selectedProject = useSelectedProject();
	const { mutate: createProject, isPending: isPendingCreate } = useCreateProject();
	const { mutate: updateProject, isPending: isPendingUpdate } = useUpdateProject();
	const formMethods = useForm({
		resolver: zodResolver(projectSchema),
		values: { ...defaultValues, ...selectedProject },
	});

	const handleSubmit = formMethods.handleSubmit(
		data => {
			const muation = selectedProject ? updateProject : createProject;
			muation(data);
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

const defaultValues: Project = {
	name: '',
	opportunityStatement: '',
	isPublic: false,
	endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // default to 30 days from now
	id: crypto.randomUUID(),
	users: [],
	scenarios: [
		{
			id: crypto.randomUUID(),
			project_id: crypto.randomUUID(),
			name: 'main',
			objectives: [],
			is_default: true,
		},
	],
};
