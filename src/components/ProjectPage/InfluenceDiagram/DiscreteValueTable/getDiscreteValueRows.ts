import { Issue } from '../../../../validators';
import {
	ParentDescriptor,
	ParentStateValue,
	buildRowKey,
	buildSortKey,
	getParentRowSpans,
} from '../ProbabilityTable/utils';

export type ParentStateInfo = { name: string; issueName: string; issueId: string };

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

	const parentIssueMap = new Map<string, ParentDescriptor>();
	const addParent = (
		stateId: string,
		kind: ParentDescriptor['kind'],
		lookup: ParentStateLookups['optionMap'],
	) => {
		const info = lookup.get(stateId);
		if (info && !parentIssueMap.has(info.issueId)) {
			parentIssueMap.set(info.issueId, {
				issueId: info.issueId,
				issueName: info.issueName,
				kind,
				states: [],
			});
		}
	};

	for (const value of values) {
		for (const optionId of value.parent_option_ids) {
			addParent(optionId, 'decision', lookups.optionMap);
		}
		for (const outcomeId of value.parent_outcome_ids) {
			addParent(outcomeId, 'uncertainty', lookups.outcomeMap);
		}
	}

	const addState = (stateId: string, lookup: ParentStateLookups['optionMap']) => {
		const info = lookup.get(stateId);
		const parent = info && parentIssueMap.get(info.issueId);
		if (info && parent && !parent.states.some(state => state.id === stateId)) {
			parent.states.push({ id: stateId, name: info.name });
		}
	};

	for (const value of values) {
		for (const optionId of value.parent_option_ids) {
			addState(optionId, lookups.optionMap);
		}
		for (const outcomeId of value.parent_outcome_ids) {
			addState(outcomeId, lookups.outcomeMap);
		}
	}

	const parents = [...parentIssueMap.values()].sort((a, b) =>
		a.issueName.localeCompare(b.issueName),
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
