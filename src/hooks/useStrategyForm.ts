import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Strategy, strategySchema } from '../validators';
import { useCreateStrategy } from './api/useCreateStrategy';
import { useSelectedProject } from './useSelectedProject';

export const useStrategyForm = (strategy?: Strategy) => {
	const selectedProject = useSelectedProject();

	const { mutate: createStrategy, isPending } = useCreateStrategy(() => {
		formMethods.reset(getDefaultValues(selectedProject?.id || crypto.randomUUID()));
	});

	const defaultValues = useMemo(
		() => getDefaultValues(selectedProject?.id || crypto.randomUUID()),
		[selectedProject?.id],
	);

	const formMethods = useForm({
		values: {
			...defaultValues,
			...strategy,
		},
		resolver: zodResolver(strategySchema),
	});

	const handleSubmit = formMethods.handleSubmit(
		data => {
			return createStrategy(data);
		},
		errors => {
			// eslint-disable-next-line no-console
			console.error('Form errors:', errors);
		},
	);

	return {
		formMethods,
		handleSubmit,
		isPending,
	};
};

const getDefaultValues = (projectId: string): Strategy => ({
	project_id: projectId,
	id: crypto.randomUUID(),
	name: '',
	description: '',
	options: [],
	rationale: '',
});
