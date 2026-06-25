import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Strategy, strategySchema } from '../validators';
import { useUpdateStrategy } from './api/useUpdateStrategy';
import { useCreateStrategyOptimistic } from './api/useCreateStrategy';
import { useSelectedProject } from '../components/ProjectPage/ProjectContext';
import { useSelectedProjectStrategies } from './useSelectedProjectStrategies';
import { strategyIconKeys } from '../components/ProjectPage/Strategies/icons';

export const useStrategyForm = (strategy?: Strategy) => {
	const selectedProject = useSelectedProject();
	const { selectedStrategies } = useSelectedProjectStrategies();

	const { mutate: createStrategy, isPending: isCreatePending } = useCreateStrategyOptimistic({
		onSuccess: () => {
			formMethods.reset(getDefaultValues(selectedProject.id, selectedStrategies));
		},
	});
	const { mutate: updateStrategy, isPending: isUpdatePending } = useUpdateStrategy();

	const defaultValues = useMemo(
		() => getDefaultValues(selectedProject.id, selectedStrategies),
		[selectedProject.id, selectedStrategies],
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

const getDefaultValues = (projectId: string, existingStrategies: Strategy[]): Strategy => {
	const icon =
		strategyIconKeys.filter(
			iconKey => !existingStrategies.some(strategy => strategy.icon === iconKey),
		)[0] || 'flash';
	return {
		project_id: projectId,
		id: crypto.randomUUID(),
		name: '',
		description: '',
		options: [],
		rationale: '',
		icon,
		icon_color: '#007079',
	};
};
