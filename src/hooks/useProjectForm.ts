import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Project, projectSchema } from '../validators';
import { useSelectedProject } from './useSelectedProject';
import { useCreateProject } from './api/useCreateProject';
import { useUpdateProject } from './api/useUpdateProject';

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
		...formMethods,
		handleSubmit,
		isPending: isPendingCreate || isPendingUpdate,
	};
};

const defaultValues: Project = {
	name: '',
	description: '',
	id: crypto.randomUUID(),
	users: [
		// {
		// 	user_id: 1,
		// 	project_id: crypto.randomUUID(),
		// 	azure_id: crypto.randomUUID(),
		// 	role: 'contributor',
		// },
	],
	scenarios: [
		{
			id: crypto.randomUUID(),
			project_id: crypto.randomUUID(),
			name: 'main',
			objectives: [],
			opportunities: [],
			is_default: true,
		},
	],
};
