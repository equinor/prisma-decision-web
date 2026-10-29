import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { useSelectedProject } from '../components/ProjectPage/ProjectContext';
import { createIssueDraft } from '../utils/createIssueDraft';
import { getNextIssuePosition } from '../utils/getNextIssuePosition';
import { sortByCreatedAt } from '../utils/sortByCreatedAt';
import { Issue, IssueType, issueSchema } from '../validators';
import { useCreateIssue } from './api/useCreateIssue';
import { useGetIssues } from './api/useGetIssues';
import { useUpdateIssue } from './api/useUpdateIssue';

export const useIssueFormContext = () => useFormContext<Issue>();
export const useIssueForm = ({ issue, issueType, onSuccess }: UseIssueFormArgs) => {
	const selectedProject = useSelectedProject();
	const defaultValues = useMemo(
		() => ({ ...createIssueDraft(selectedProject.id), ...(issueType && { type: issueType }) }),
		[selectedProject.id, issueType],
	);
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
		mode: 'onChange',
		values: { ...defaultValues, ...sortedIssue },
		resolver: zodResolver(issueSchema),
	});
	const { issues } = useGetIssues();
	const { mutate: createIssue, isPending: isCreating } = useCreateIssue({
		onSuccess: () => {
			const { id, type, boundary } = formMethods.getValues();
			formMethods.reset({ ...createIssueDraft(selectedProject.id), type, boundary });
			onSuccess?.(id);
		},
	});

	const { mutate: updateIssue, isPending: isUpdating } = useUpdateIssue({
		onSuccess: () => {
			if (issue) onSuccess?.(issue.id);
		},
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
	issueType?: IssueType;
	onSuccess?: (id: string) => void;
};
