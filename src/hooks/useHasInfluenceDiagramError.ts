import { useSelectedProjectIssues } from './useSelectedProjectIssues';
import { useSelectedProjectInfluenceNodes } from './useSelectedProjectInfluenceNodes';
import { useSelectedProjectEdges } from './useSelectedProjectEdges';
import {
	hasIssues,
	hasLoops,
	hasMissingEdges,
	hasOptionsMissing,
	hasOutcomesMissing,
	ValidateProbabilityTable,
} from '../utils/influenceDiagramValidationUtils';

export const useHasInfluenceDiagramError = () => {
	const issues = useSelectedProjectIssues();
	const nodes = useSelectedProjectInfluenceNodes();
	const edges = useSelectedProjectEdges();
	const reactFlowEdges = edges.map(e => ({ id: e.id, source: e.tail_id, target: e.head_id }));
	const hasValidationErrors =
		!hasIssues(nodes) ||
		hasMissingEdges(edges) ||
		hasLoops(nodes, reactFlowEdges) ||
		hasOptionsMissing(nodes, issues) ||
		hasOutcomesMissing(nodes, issues) ||
		ValidateProbabilityTable(nodes, issues);

	return hasValidationErrors;
};
