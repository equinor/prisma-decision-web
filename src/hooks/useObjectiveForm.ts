import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Objective, objectiveSchema } from '../validators';
import { useUpdateObjective } from './api/useUpdateObjective';
import { useCreateObjectiveOptimistic } from './api/useCreateObjective';
import { useSelectedProject } from '../components/ProjectPage/ProjectContext';

export const useObjectiveForm = ({ objective, onSuccess }: UseObjectiveFormArgs) => {
	const selectedProject = useSelectedProject();

	const defaultValues = useMemo(
		() => objective || getDefaultValues(selectedProject.id),
		[selectedProject.id, objective],
	);

	const formMethods = useForm({
		defaultValues,
		resolver: zodResolver(objectiveSchema),
	});

	const { mutate: createObjective, isPending: isCreating } = useCreateObjectiveOptimistic({
		onSuccess: () => {
			formMethods.reset(getDefaultValues(selectedProject.id));
			onSuccess?.();
		},
	});

	const { mutate: updateObjective, isPending: isUpdating } = useUpdateObjective({
		onSuccess: onSuccess,
	});

	const handleSubmit = formMethods.handleSubmit(
		data => {
			const mutationFn = objective ? updateObjective : createObjective;
			return mutationFn({
				...data,
			});
		},
		errors => {
			// eslint-disable-next-line no-console
			console.error('Form errors:', errors);
		},
	);

	return {
		...formMethods,
		handleSubmit,
		isPending: isCreating || isUpdating,
	};
};

const getDefaultValues = (projectId: string): Objective => ({
	project_id: projectId,
	name: '',
	description: '',
	type: 'Fundamental',
	id: crypto.randomUUID(),
});

type UseObjectiveFormArgs = {
	objective?: Objective;
	onSuccess?: () => void;
};
