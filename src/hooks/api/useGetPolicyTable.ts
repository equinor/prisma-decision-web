import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { useHasInfluenceDiagramError } from '../useHasInfluenceDiagramError';
import { useSelectedProject } from '../../components/ProjectPage/ProjectContext';
import { useSelectedProjectIssues } from '../useSelectedProjectIssues';
import { DiscretePolicy, discretePolicySchema } from '../../validators';

type PolicyTableResponse = {
	decision_id: string;
	parent_state_ids: string[];
	option_id: string;
	value: number;
};

const defaultDiscretePolicies: DiscretePolicy[] = [];

export const useGetPolicyTable = () => {
	const selectedProject = useSelectedProject();
	const issues = useSelectedProjectIssues();
	const projectId = selectedProject.id;
	const { hasError: hasValidationError } = useHasInfluenceDiagramError();
	const { data = defaultDiscretePolicies, ...rest } = useQuery({
		queryKey: ['policyTable', projectId],
		queryFn: async () => {
			const optionIds = new Set(
				issues.flatMap(issue =>
					issue.type === 'Decision'
						? issue.decision.options.map(option => option.id)
						: [],
				),
			);
			const outcomeIds = new Set(
				issues.flatMap(issue =>
					issue.type === 'Uncertainty'
						? issue.uncertainty.outcomes.map(outcome => outcome.id)
						: [],
				),
			);
			const res = await apiClient.post<PolicyTableResponse[]>(
				`solvers/project/${projectId}/policy_table`,
			);
			return res.data.map(row =>
				discretePolicySchema.parse({
					decision_id: row.decision_id,
					option_id: row.option_id,
					value: row.value,
					parent_option_ids: row.parent_state_ids.filter(
						id => optionIds.has(id) && id !== row.option_id,
					),
					parent_outcome_ids: row.parent_state_ids.filter(id => outcomeIds.has(id)),
				}),
			);
		},
		enabled: !!projectId && !hasValidationError,
		meta: {
			errorMessage: 'Failed to fetch policy table',
		},
	});

	return {
		data,
		...rest,
	};
};
