import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { Issue, issueSchema } from '../validators';
import { useCreateIssue } from './api/useCreateIssue';
import { useUpdateIssue } from './api/useUpdateIssue';
import { useGetIssues } from './api/useGetIssues';
import { getNextIssuePosition } from '../utils/getNextIssuePosition';
import { sortByCreatedAt } from '../utils/sortByCreatedAt';
import { useSelectedProject } from '../components/ProjectPage/ProjectContext';
import { createIssueDraft } from '../utils/createIssueDraft';

export const useIssueFormContext = () => useFormContext<Issue>();
export const useIssueForm = ({ issue, onSuccess }: UseIssueFormArgs) => {
	const selectedProject = useSelectedProject();
	const defaultValues = useMemo(() => createIssueDraft(selectedProject.id), [selectedProject.id]);
	const sortedIssue = useMemo(() => {
		if (!issue) return;
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
			formMethods.reset(createIssueDraft(selectedProject.id));
			onSuccess?.();
		},
	});

	const { mutate: updateIssue, isPending: isUpdating } = useUpdateIssue({
		onSuccess: onSuccess,
		scope: issue?.id,
	});
	const onSubmit = formMethods.handleSubmit(
		async data => {
			const mutationFn = issue ? updateIssue : createIssue;
			if (issue) return await mutationFn(data);

			const projectId = selectedProject.id;
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

type UseIssueFormArgs = {
	issue?: Issue;
	onSuccess?: () => void;
};
