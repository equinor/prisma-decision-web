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

	const validationErrors: Record<string, boolean> = {
		Issues: !hasIssues(nodes, issues),
		Edges: hasMissingEdges(edges),
		NoLoops: hasLoops(nodes, reactFlowEdges, issues),
		DecisionOptions: hasOptionsMissing(nodes, issues),
		UncertaintyOutcomes: hasOutcomesMissing(nodes, issues),
		ProbabilityTable: ValidateProbabilityTable(nodes, issues),
	};

	const hasError = Object.values(validationErrors).some(Boolean);

	return { hasError, validationErrors };
};
