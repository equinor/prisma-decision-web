import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { opportunitySchema } from '../validators';
import { useCreateOpportunityOptimistic } from './api/useCreateOpportunity';
import { useSelectedProject } from './useSelectedProject';

export const useOppportunityForm = () => {
	const selectedProject = useSelectedProject();
	const { mutate: createOpportunity } = useCreateOpportunityOptimistic();
	const scenario = selectedProject?.scenarios[0];
	const formMethods = useForm({
		values: {
			...defaultValues,
			scenario_id: scenario?.id || crypto.randomUUID(),
		},
		resolver: zodResolver(opportunitySchema),
	});

	const handleSubmit = formMethods.handleSubmit(
		async data => {
			await createOpportunity(data);
			formMethods.reset();
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
