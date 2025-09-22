import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { opportunitySchema } from '../validators';
import { useCreateOpportunityOptimistic } from './api/useCreateOpportunity';
import { useSelectedScenario } from './useSelectedScenario';

export const useOppportunityForm = (onSuccess?: () => void) => {
	const scenario = useSelectedScenario();
	const { mutate: createOpportunity } = useCreateOpportunityOptimistic();
	const formMethods = useForm({
		values: {
			...defaultValues,
			scenario_id: scenario?.id || crypto.randomUUID(),
		},
		resolver: zodResolver(opportunitySchema),
	});

	const handleSubmit = formMethods.handleSubmit(
		async data => {
			onSuccess?.();
			await createOpportunity(data);
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
