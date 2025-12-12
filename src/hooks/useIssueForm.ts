import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { Issue, issueSchema } from '../validators';
import { useCreateIssue } from './api/useCreateIssue';
import { useUpdateIssue } from './api/useUpdateIssue';
import { useSelectedScenario } from './useSelectedScenario';
import { useGetIssues } from './api/useGetIssues';
import { getNextIssuePosition } from '../utils/getNextIssuePosition';

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
	const { issues } = useGetIssues();
	const { mutate: createIssue, isPending: isCreating } = useCreateIssue({
		onSuccess: () => {
			formMethods.reset(getDefaultValues(selectedScenario?.id || crypto.randomUUID()));
			onSuccess?.();
		},
	});

	const { mutate: updateIssue, isPending: isUpdating } = useUpdateIssue({ onSuccess: onSuccess });
	const onSubmit = formMethods.handleSubmit(
		async data => {
			const mutationFn = issue ? updateIssue : createIssue;
			if (issue) return await mutationFn(data);

			const scenarioId = selectedScenario?.id || data.scenario_id;
			const scenarioIssues = issues.filter(i => i.scenario_id === scenarioId);
			const { x, y } = getNextIssuePosition(scenarioIssues);
			await mutationFn({
				...data,
				node: {
					...data.node,
					node_style: {
						...data.node.node_style,
						x_position: x,
						y_position: y,
					},
				},
			});
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
	const id = crypto.randomUUID();
	return {
		boundary: 'on',
		name: '',
		description: '',
		type: 'Unassigned',
		id,
		order: 0,
		scenario_id: scenarioId,
		decision: {
			id: crypto.randomUUID(),
			issue_id: id,
			type: 'Policy',
			options: [],
		},
		uncertainty: {
			id: crypto.randomUUID(),
			issue_id: id,
			is_key: false,
			outcomes: [],
			discrete_probabilities: [],
		},
		utility: {
			id: crypto.randomUUID(),
			issue_id: id,
			discrete_utilities: [],
		},
		value_metric: {
			id: '288e0811-7ab6-5d24-b80c-9fa925b848a6',
			issue_id: id,
			name: '',
		},
		node: {
			id: crypto.randomUUID(),
			issue_id: id,
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
