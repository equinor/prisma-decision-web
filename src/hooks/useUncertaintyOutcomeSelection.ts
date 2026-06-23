import { useProbablityTable } from '../components/ProjectPage/InfluenceDiagram/ProbabilityTable/useProbablityTable';
import { useInfluenceDiagramEvidence } from './useInfluenceDiagramEvidence';
import { Issue, Outcome } from '../validators';

type UseUncertaintyOutcomeSelectionParams = {
	issue: Issue;
	sortedOutcomes: Outcome[];
	selectedOutcome?: Outcome;
	disableZeroProbabilityOutcomes: boolean;
};

export const useUncertaintyOutcomeSelection = ({
	issue,
	sortedOutcomes,
	selectedOutcome,
	disableZeroProbabilityOutcomes,
}: UseUncertaintyOutcomeSelectionParams) => {
	const { evidence } = useInfluenceDiagramEvidence();
	const { rows } = useProbablityTable(issue);

	const outcomesWithZeroProbability = new Set<string>();

	if (disableZeroProbabilityOutcomes) {
		if (evidence.length === 1) {
			const selectedEvidenceId = evidence[0];
			const outcomeParentProbabilities = new Map<
				string,
				Array<{ parentIds: string[]; probability: number }>
			>();

			rows.forEach(row => {
				row.values.forEach(prob => {
					const parentIds = [...prob.parent_option_ids, ...prob.parent_outcome_ids];
					if (!parentIds.includes(selectedEvidenceId)) return;
					const existing = outcomeParentProbabilities.get(prob.outcome_id) ?? [];

					existing.push({
						parentIds,
						probability: prob.probability,
					});

					outcomeParentProbabilities.set(prob.outcome_id, existing);
				});
			});

			outcomeParentProbabilities.forEach((parentProbabilities, outcomeId) => {
				const allProbabilitiesZero = parentProbabilities.every(
					prob => prob.probability === 0,
				);
				if (allProbabilitiesZero) outcomesWithZeroProbability.add(outcomeId);
			});
		} else {
			rows.forEach(row => {
				const firstProbability = row.values[0];
				if (!firstProbability) return;

				const rowParentIds = [
					...firstProbability.parent_option_ids,
					...firstProbability.parent_outcome_ids,
				];
				const rowMatchesEvidence = rowParentIds.every(parentId =>
					evidence.includes(parentId),
				);
				if (!rowMatchesEvidence) return;

				row.values.forEach(prob => {
					if (prob.probability === 0) outcomesWithZeroProbability.add(prob.outcome_id);
				});
			});
		}
	}

	const enabledOutcomes = sortedOutcomes.filter(
		outcome => !outcomesWithZeroProbability.has(outcome.id),
	);
	const impliedSelectedOutcomeId =
		enabledOutcomes.length === 1 ? enabledOutcomes[0].id : undefined;
	const activeOutcomeId = selectedOutcome?.id ?? impliedSelectedOutcomeId;

	return {
		outcomesWithZeroProbability,
		activeOutcomeId,
	};
};
