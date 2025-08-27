import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { Issue, issueSchema } from '../validators';
import { useCreateIssue } from './api/useCreateIssue';
import { useUpdateIssue } from './api/useUpdateIssue';
import { useSelectedScenario } from './useSelectedScenario';

export const useIssueFormContext = () => useFormContext<Issue>();
export const useIssueForm = ({ issue, onSuccess }: UseIssueFormArgs) => {
	const selectedScenario = useSelectedScenario();
	const defaultValues = useMemo(
		() => getDefaultValues(selectedScenario?.id || crypto.randomUUID()),
		[],
	);
	const formMethods = useForm({
		values: { ...defaultValues, ...issue },
		resolver: zodResolver(issueSchema),
	});
	const { mutate: createIssue, isPending: isCreating } = useCreateIssue({
		onSuccess: () => {
			formMethods.reset(getDefaultValues(selectedScenario?.id || crypto.randomUUID()));
			onSuccess?.();
		},
	});

	const { mutate: updateIssue, isPending: isUpdating } = useUpdateIssue();
	const onSubmit = formMethods.handleSubmit(
		async data => {
			const mutationFn = issue ? updateIssue : createIssue;
			await mutationFn(data);
		},
		errors => {
			// eslint-disable-next-line no-console
			console.error('Form errors:', errors);
		},
	);

	return {
		...formMethods,
		onSubmit,
		isPending: isCreating || isUpdating,
	};
};

const getDefaultValues = (scenarioId: string): Issue => {
	return {
		boundary: 'on',
		name: '',
		description: '',
		type: 'Unassigned',
		id: crypto.randomUUID(),
		order: 0,
		scenario_id: scenarioId,
		decision: {
			id: crypto.randomUUID(),
			issue_id: crypto.randomUUID(),
			alternatives: [],
		},
		uncertainty: {
			id: crypto.randomUUID(),
			issue_id: crypto.randomUUID(),
			probabilities: [],
		},
		utility: {
			id: crypto.randomUUID(),
			issue_id: crypto.randomUUID(),
			values: [0],
		},
		value_metric: {
			id: crypto.randomUUID(),
			issue_id: crypto.randomUUID(),
			name: '',
		},
		node: {
			id: crypto.randomUUID(),
			issue_id: crypto.randomUUID(),
			name: 'default',
			scenario_id: scenarioId,
			node_style: {
				id: crypto.randomUUID(),
				node_id: crypto.randomUUID(),
				x_position: 0,
				y_position: 0,
			},
		},
	};
};

type UseIssueFormArgs = {
	issue?: Issue;
	onSuccess?: () => void;
};
