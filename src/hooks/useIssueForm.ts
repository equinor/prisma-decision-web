import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { Issue, issueSchema } from '../validators';
import { useCreateIssue } from './api/useCreateIssue';
import { useUpdateIssue } from './api/useUpdateIssue';
import { useGetIssues } from './api/useGetIssues';
import { getNextIssuePosition } from '../utils/getNextIssuePosition';
import { sortByCreatedAt } from '../utils/sortByCreatedAt';
import { useSelectedProject } from './useSelectedProject';

export const useIssueFormContext = () => useFormContext<Issue>();
export const useIssueForm = ({ issue, onSuccess }: UseIssueFormArgs) => {
	const selectedProject = useSelectedProject();
	const defaultValues = useMemo(
		() => getDefaultValues(selectedProject?.id || crypto.randomUUID()),
		[],
	);
	const sortedIssue = useMemo(() => {
		if (!issue) return undefined;
		return {
			...issue,
			decision: {
				...issue.decision,
				options: sortByCreatedAt(issue.decision.options),
			},
			uncertainty: {
				...issue.uncertainty,
				outcomes: sortByCreatedAt(issue.uncertainty.outcomes),
			},
		};
	}, [issue]);
	const formMethods = useForm({
		values: { ...defaultValues, ...sortedIssue },
		resolver: zodResolver(issueSchema),
	});
	const { issues } = useGetIssues();
	const { mutate: createIssue, isPending: isCreating } = useCreateIssue({
		onSuccess: () => {
			formMethods.reset(getDefaultValues(selectedProject?.id || crypto.randomUUID()));
			onSuccess?.();
		},
	});

	const { mutate: updateIssue, isPending: isUpdating } = useUpdateIssue({ onSuccess: onSuccess });
	const onSubmit = formMethods.handleSubmit(
		async data => {
			const mutationFn = issue ? updateIssue : createIssue;
			if (issue) return await mutationFn(data);

			const projectId = selectedProject?.id || data.project_id;
			const projectIssues = issues.filter(i => i.project_id === projectId);
			const { x, y } = getNextIssuePosition(projectIssues);
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

const getDefaultValues = (projectId: string): Issue => {
	const id = crypto.randomUUID();
	return {
		boundary: 'on',
		name: '',
		description: '',
		type: 'Unassigned',
		id,
		order: 0,
		project_id: projectId,
		decision: {
			id: crypto.randomUUID(),
			issue_id: id,
			project_id: projectId,
			type: 'Policy',
			options: [],
		},
		uncertainty: {
			id: crypto.randomUUID(),
			issue_id: id,
			project_id: projectId,
			is_key: false,
			outcomes: [],
			discrete_probabilities: [],
		},
		utility: {
			id: crypto.randomUUID(),
			issue_id: id,
			project_id: projectId,
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
			project_id: projectId,
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
