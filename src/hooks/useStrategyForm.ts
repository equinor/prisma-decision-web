import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Strategy, strategySchema } from '../validators';
import { useUpdateStrategy } from './api/useUpdateStrategy';
import { useSelectedProject } from './useSelectedProject';
import { useCreateStrategyOptimistic } from './api/useCreateStrategy';

export const useStrategyForm = (strategy?: Strategy) => {
	const selectedProject = useSelectedProject();

	const { mutate: createStrategy, isPending: isCreatePending } = useCreateStrategyOptimistic({
		onSuccess: () => {
			formMethods.reset(getDefaultValues(selectedProject?.id || crypto.randomUUID()));
		},
	});
	const { mutate: updateStrategy, isPending: isUpdatePending } = useUpdateStrategy();

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
			const mutationFn = strategy ? updateStrategy : createStrategy;
			return mutationFn({
				...data,
			});
		},
		errors => {
			// eslint-disable-next-line no-console
			console.error('Form errors:', errors);
		},
	);

	const isPending = isCreatePending || isUpdatePending;

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
	icon: 'flash',
});
