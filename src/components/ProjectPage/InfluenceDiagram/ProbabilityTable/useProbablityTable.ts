import { useMemo } from 'react';
import { useSelectedProjectIssues } from '../../../../hooks/useSelectedProjectIssues';
import { Issue, DiscreteProbability } from '../../../../validators';
import { ParentDescriptor, getParentRowSpans, buildRowKey, buildSortKey } from './utils';

export const useProbablityTable = (issue: Issue) => {
	const issues = useSelectedProjectIssues();
	const childOutcomes = issue.uncertainty.outcomes;
	const discreteProbabilities = issue.uncertainty.discrete_probabilities;
	// Build lookup maps for option/outcome names from all issues
	const lookups = useMemo(() => {
		const optionMap = new Map<string, { name: string; issueName: string; issueId: string }>();
		const outcomeMap = new Map<string, { name: string; issueName: string; issueId: string }>();

		for (const iss of issues) {
			if (iss.type === 'Decision') {
				for (const option of iss.decision.options) {
					optionMap.set(option.id, {
						name: option.name,
						issueName: iss.name,
						issueId: iss.id,
					});
				}
			}
			if (iss.type === 'Uncertainty') {
				for (const outcome of iss.uncertainty.outcomes) {
					outcomeMap.set(outcome.id, {
						name: outcome.name,
						issueName: iss.name,
						issueId: iss.id,
					});
				}
			}
		}

		return { optionMap, outcomeMap };
	}, [issues]);

	// Build parent descriptors from discrete_probabilities
	const parents: ParentDescriptor[] = useMemo(() => {
		if (!discreteProbabilities.length) return [];

		// Collect unique parent issues from the first discrete probability
		const firstDp = discreteProbabilities[0];
		const parentIssueMap = new Map<string, ParentDescriptor>();

		// Process parent options (from decisions)
		for (const optionId of firstDp.parent_option_ids) {
			const info = lookups.optionMap.get(optionId);
			if (info && !parentIssueMap.has(info.issueId)) {
				parentIssueMap.set(info.issueId, {
					issueId: info.issueId,
					issueName: info.issueName,
					kind: 'decision',
					states: [],
				});
			}
		}

		// Process parent outcomes (from uncertainties)
		for (const outcomeId of firstDp.parent_outcome_ids) {
			const info = lookups.outcomeMap.get(outcomeId);
			if (info && !parentIssueMap.has(info.issueId)) {
				parentIssueMap.set(info.issueId, {
					issueId: info.issueId,
					issueName: info.issueName,
					kind: 'uncertainty',
					states: [],
				});
			}
		}

		// Collect all states for each parent from all discrete_probabilities
		for (const dp of discreteProbabilities) {
			for (const optionId of dp.parent_option_ids) {
				const info = lookups.optionMap.get(optionId);
				if (info) {
					const parent = parentIssueMap.get(info.issueId);
					if (parent && !parent.states.find(s => s.id === optionId)) {
						parent.states.push({ id: optionId, name: info.name });
					}
				}
			}
			for (const outcomeId of dp.parent_outcome_ids) {
				const info = lookups.outcomeMap.get(outcomeId);
				if (info) {
					const parent = parentIssueMap.get(info.issueId);
					if (parent && !parent.states.find(s => s.id === outcomeId)) {
						parent.states.push({ id: outcomeId, name: info.name });
					}
				}
			}
		}

		// Sort parents by issue name for consistent column order
		return [...parentIssueMap.values()].sort((a, b) => a.issueName.localeCompare(b.issueName));
	}, [discreteProbabilities, lookups]);

	const parentRowSpans = getParentRowSpans(parents);

	// Group discrete probabilities by their parent combination (row key)
	// and sort rows to create tree structure
	const rows = useMemo(() => {
		const rowMap = new Map<string, DiscreteProbability[]>();

		for (const dp of discreteProbabilities) {
			const rowKey = buildRowKey(dp.parent_option_ids, dp.parent_outcome_ids);
			const existing = rowMap.get(rowKey) ?? [];
			existing.push(dp);
			rowMap.set(rowKey, existing);
		}

		const rowList = Array.from(rowMap.entries()).map(([rowKey, probabilities]) => ({
			rowKey,
			probabilities,
			// Build sort key based on parent order
			sortKey: buildSortKey(probabilities[0], parents, lookups),
		}));

		// Sort rows to create tree structure (first parent varies slowest, last parent varies fastest)
		rowList.sort((a, b) => a.sortKey.localeCompare(b.sortKey));

		return rowList;
	}, [discreteProbabilities, parents, lookups]);
	return {
		childOutcomes,
		parents,
		parentRowSpans,
		rows,
		lookups,
	};
};
