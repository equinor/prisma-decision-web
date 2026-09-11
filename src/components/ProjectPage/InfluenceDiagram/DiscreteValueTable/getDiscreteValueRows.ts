import { sortByCreatedAt } from '../../../../utils/sortByCreatedAt';
import { Issue } from '../../../../validators';
import {
	ParentDescriptor,
	ParentStateValue,
	buildRowKey,
	buildSortKey,
	getParentRowSpans,
} from '../ProbabilityTable/utils';

export type ParentStateInfo = {
	name: string;
	issueName: string;
	issueId: string;
};

export type ParentStateLookups = {
	optionMap: Map<string, ParentStateInfo>;
	outcomeMap: Map<string, ParentStateInfo>;
};

export const getParentStateLookups = (issues: Issue[]): ParentStateLookups => {
	const lookups: ParentStateLookups = {
		optionMap: new Map(),
		outcomeMap: new Map(),
	};

	for (const issue of issues) {
		if (issue.type === 'Decision') {
			for (const option of issue.decision.options) {
				lookups.optionMap.set(option.id, {
					name: option.name,
					issueName: issue.name,
					issueId: issue.id,
				});
			}
		}

		if (issue.type === 'Uncertainty') {
			for (const outcome of issue.uncertainty.outcomes) {
				lookups.outcomeMap.set(outcome.id, {
					name: outcome.name,
					issueName: issue.name,
					issueId: issue.id,
				});
			}
		}
	}

	return lookups;
};

export const getDiscreteValueRows = <T extends ParentStateValue>(values: T[], issues: Issue[]) => {
	const lookups = getParentStateLookups(issues);

	if (!values.length) {
		return { lookups, parents: [], parentRowSpans: [], rows: [] };
	}

	const parentOptionIds = new Set(values.flatMap(value => value.parent_option_ids));
	const parentOutcomeIds = new Set(values.flatMap(value => value.parent_outcome_ids));
	const parents: ParentDescriptor[] = [];

	for (const issue of issues) {
		if (issue.type === 'Decision') {
			const states = sortByCreatedAt(issue.decision.options)
				.filter(option => parentOptionIds.has(option.id))
				.map(option => ({ id: option.id, name: option.name }));
			if (states.length) {
				parents.push({
					issueId: issue.id,
					issueName: issue.name,
					kind: 'decision',
					states,
				});
			}
		}

		if (issue.type === 'Uncertainty') {
			const states = sortByCreatedAt(issue.uncertainty.outcomes)
				.filter(outcome => parentOutcomeIds.has(outcome.id))
				.map(outcome => ({ id: outcome.id, name: outcome.name }));
			if (states.length) {
				parents.push({
					issueId: issue.id,
					issueName: issue.name,
					kind: 'uncertainty',
					states,
				});
			}
		}
	}

	parents.sort(
		(a, b) => a.issueName.localeCompare(b.issueName) || a.issueId.localeCompare(b.issueId),
	);
	const rowMap = new Map<string, T[]>();

	for (const value of values) {
		const rowKey = buildRowKey(value.parent_option_ids, value.parent_outcome_ids);
		rowMap.set(rowKey, [...(rowMap.get(rowKey) ?? []), value]);
	}

	const rows = Array.from(rowMap.entries()).map(([rowKey, rowValues]) => ({
		rowKey,
		values: rowValues,
		sortKey: buildSortKey(rowValues[0], parents, lookups),
	}));
	rows.sort((a, b) => a.sortKey.localeCompare(b.sortKey));

	return {
		lookups,
		parents,
		parentRowSpans: getParentRowSpans(parents),
		rows,
	};
};
