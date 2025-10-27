import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Objective, objectiveSchema } from '../validators';
import { useCreateObjective } from './api/useCreateObjective';
import { useUpdateObjective } from './api/useUpdateObjective';
import { useSelectedScenario } from './useSelectedScenario';

export const useObjectiveForm = ({ objective, onSuccess }: UseObjectiveFormArgs) => {
	const selectedScenario = useSelectedScenario();
	const defaultValues = useMemo(
		() => getDefaultValues(selectedScenario?.id || crypto.randomUUID()),
		[selectedScenario?.id],
	);

	const formMethods = useForm({
		values: {
			...defaultValues,
			...objective,
		},
		resolver: zodResolver(objectiveSchema),
	});

	const { mutate: createObjective, isPending: isCreating } = useCreateObjective({
		onSuccess: () => {
			formMethods.reset(getDefaultValues(selectedScenario?.id || crypto.randomUUID()));
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

const getDefaultValues = (scenarioId: string): Objective => ({
	scenario_id: scenarioId,
	name: '',
	description: '',
	id: crypto.randomUUID(),
});

type UseObjectiveFormArgs = {
	objective?: Objective;
	onSuccess?: () => void;
};
