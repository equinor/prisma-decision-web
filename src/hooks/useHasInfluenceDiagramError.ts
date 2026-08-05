import {
	hasIssues,
	hasLoops,
	hasMissingEdges,
	hasOptionsMissing,
	hasOutcomesMissing,
	ValidateProbabilityTable,
} from '../utils/influenceDiagramValidationUtils';
import { useGetProbabilityTables } from './api/useGetProbabilityTables';
import { useSelectedProjectEdges } from './useSelectedProjectEdges';
import { useSelectedProjectInfluenceNodes } from './useSelectedProjectInfluenceNodes';
import { useSelectedProjectIssues } from './useSelectedProjectIssues';

export const useHasInfluenceDiagramError = () => {
	const issues = useSelectedProjectIssues();
	const { data } = useGetProbabilityTables();
	const { nodes } = useSelectedProjectInfluenceNodes();
	const { edges } = useSelectedProjectEdges();
	const reactFlowEdges = edges.map(e => ({ id: e.id, source: e.tail_id, target: e.head_id }));
	const validationErrors = {
		Issues: !hasIssues(nodes, issues),
		Edges: hasMissingEdges(edges),
		edgesInLoop: hasLoops(nodes, reactFlowEdges, issues),
		DecisionOptions: hasOptionsMissing(nodes, issues),
		UncertaintyOutcomes: hasOutcomesMissing(nodes, issues),
		ProbabilityTable: ValidateProbabilityTable(nodes, issues, data),
	};

	const hasError = Object.values(validationErrors).some(value =>
		Array.isArray(value) ? value.length > 0 : value,
	);

	return { hasError, validationErrors };
};
