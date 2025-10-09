import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { objectiveSchema } from '../validators';
import { useCreateObjectiveOptimistic } from './api/useCreateObjective';
import { useSelectedScenario } from './useSelectedScenario';

export const useObjectiveForm = (onSuccess?: () => void) => {
	const scenario = useSelectedScenario();
	const { mutate: createObjective } = useCreateObjectiveOptimistic();
	const formMethods = useForm({
		values: {
			...defaultValues,
			scenario_id: scenario?.id || crypto.randomUUID(),
		},
		resolver: zodResolver(objectiveSchema),
	});

	const handleSubmit = formMethods.handleSubmit(
		async data => {
			onSuccess?.();
			await createObjective(data);
			formMethods.reset({
				...defaultValues,
				id: crypto.randomUUID(),
				scenario_id: scenario?.id || crypto.randomUUID(),
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
	};
};

const defaultValues = {
	name: '',
	description: '',
	id: crypto.randomUUID(),
};
