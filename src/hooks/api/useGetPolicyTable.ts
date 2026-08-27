import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { useHasInfluenceDiagramError } from '../useHasInfluenceDiagramError';
import { useSelectedProject } from '../../components/ProjectPage/ProjectContext';
import { useSelectedProjectIssues } from '../useSelectedProjectIssues';
import {
	PolicyTable,
	PolicyTableWithParentOptionOutcome,
	policyTableWithParentOptionOutcomeSchema,
} from '../../validators';

export const useGetPolicyTable = () => {
	const selectedProject = useSelectedProject();
	const issues = useSelectedProjectIssues();
	const projectId = selectedProject.id;
	const optionIdSet = new Set<string>();
	for (const issue of issues) {
		if (issue.type !== 'Decision') continue;
		for (const option of issue.decision.options) {
			optionIdSet.add(option.id);
		}
	}
	const { hasError: hasValidationError } = useHasInfluenceDiagramError();
	const { data = [], ...rest } = useQuery({
		queryKey: ['policyTable'],
		queryFn: async () => {
			const res = await apiClient.post<PolicyTable[]>(
				`solvers/project/${projectId}/policy_table`,
			);

			return res.data.map(rawRow => {
				const normalizedRow: PolicyTableWithParentOptionOutcome = {
					...rawRow,
					parent_option_ids: rawRow.parent_state_ids.filter(stateId =>
						optionIdSet.has(stateId),
					),
				};
				return policyTableWithParentOptionOutcomeSchema.parse(normalizedRow);
			});
		},
		enabled: !!projectId && !hasValidationError,
		meta: {
			errorMessage: 'Failed to fetch policy table',
		},
	});

	return {
		policyTable: data,
		...rest,
	};
};
