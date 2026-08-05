import {
	DiscreteProbability,
	discreteUtilitiesSchema,
	DiscreteUtility,
} from '../../../../validators';

export type ParentStateValue = {
	parent_option_ids: string[];
	parent_outcome_ids: string[];
};

/** Get display label for a specific parent from a discrete probability */
export const getParentLabel = (
	dp: ParentStateValue,
	parent: ParentDescriptor,
	lookups: {
		optionMap: Map<string, { name: string; issueName: string; issueId: string }>;
		outcomeMap: Map<string, { name: string; issueName: string; issueId: string }>;
	},
): string => {
	if (parent.kind === 'decision') {
		for (const optionId of dp.parent_option_ids) {
			const info = lookups.optionMap.get(optionId);
			if (info?.issueId === parent.issueId) {
				return info.name;
			}
		}
	} else {
		for (const outcomeId of dp.parent_outcome_ids) {
			const info = lookups.outcomeMap.get(outcomeId);
			if (info?.issueId === parent.issueId) {
				return info.name;
			}
		}
	}
	return '—';
};

/** Build a sort key that orders rows by parent states in tree order */
export const buildSortKey = (
	dp: ParentStateValue,
	parents: ParentDescriptor[],
	lookups: {
		optionMap: Map<string, { name: string; issueName: string; issueId: string }>;
		outcomeMap: Map<string, { name: string; issueName: string; issueId: string }>;
	},
): string => {
	const parts: string[] = [];

	for (const parent of parents) {
		// Find the state ID for this parent in the discrete probability
		let stateIndex = -1;

		if (parent.kind === 'decision') {
			for (const optionId of dp.parent_option_ids) {
				const info = lookups.optionMap.get(optionId);
				if (info?.issueId === parent.issueId) {
					stateIndex = parent.states.findIndex(s => s.id === optionId);
					break;
				}
			}
		} else {
			for (const outcomeId of dp.parent_outcome_ids) {
				const info = lookups.outcomeMap.get(outcomeId);
				if (info?.issueId === parent.issueId) {
					stateIndex = parent.states.findIndex(s => s.id === outcomeId);
					break;
				}
			}
		}

		// Pad with zeros for proper string sorting
		parts.push(stateIndex.toString().padStart(4, '0'));
	}

	return parts.join('|');
};

/** Calculate row spans for each parent column (tree structure) */
export const getParentRowSpans = (parents: ParentDescriptor[]): number[] =>
	parents.map((_, index) => {
		const remainingParents = parents.slice(index + 1);
		if (!remainingParents.length) return 1;
		return remainingParents.reduce((span, parent) => span * parent.states.length, 1);
	});

/** Build a unique key for a row based on parent option/outcome IDs */
export const buildRowKey = (optionIds: string[], outcomeIds: string[]): string => {
	const sortedOptions = [...optionIds].sort().join(',');
	const sortedOutcomes = [...outcomeIds].sort().join(',');
	const key = `${sortedOptions}|${sortedOutcomes}`;
	return key.length > 1 ? key : 'base';
};

export const calculateRowSum = (values: (DiscreteProbability | DiscreteUtility)[]): number => {
	return values.reduce((sum, v) => {
		const { success: isUtility } = discreteUtilitiesSchema.safeParse(v);
		const value = isUtility
			? (v as DiscreteUtility).utility_value
			: (v as DiscreteProbability).probability;
		return sum + value;
	}, 0);
};

export const isRowSumValid = (sum: number): boolean => {
	// Use a small epsilon for floating point comparison
	return Math.abs(sum - 1) < 0.0001;
};

export type ParentDescriptor = {
	issueId: string;
	issueName: string;
	kind: 'decision' | 'uncertainty';
	states: { id: string; name: string }[];
};
