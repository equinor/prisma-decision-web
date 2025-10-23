import { useForm } from 'react-hook-form';
import { Objective } from '../validators';
import { useCreateObjectiveOptimistic } from './api/useCreateObjective';
import { useSelectedScenario } from './useSelectedScenario';
import { useMemo } from 'react';
import { useUpdateObjective } from './api/useUpdateObjective';

export const useObjectiveForm = ({ objective, onSuccess }: UseObjectiveFormArgs) => {
	const selectedScenario = useSelectedScenario();
	const defaultValues = useMemo(
		() => getDefaultValues(selectedScenario?.id || crypto.randomUUID()),
		[selectedScenario?.id],
	);
	const formMethods = useForm<Objective>({
		values: {
			...defaultValues,
			...(objective
				? {
						id: objective.id,
						name: objective.name,
						description: objective.description,
						scenario_id: objective.scenario_id,
						// Explicitly exclude createdAt and updatedAt
					}
				: {}),
		},
	});
	const { mutate: createObjective, isPending: isCreating } = useCreateObjectiveOptimistic({
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
