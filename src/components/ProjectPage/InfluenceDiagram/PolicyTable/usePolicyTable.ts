import { useMemo } from 'react';
import { useGetPolicyTable } from '../../../../hooks/api/useGetPolicyTable';
import { useSelectedProjectIssues } from '../../../../hooks/useSelectedProjectIssues';
import { Issue, PolicyTableDecisionOutgoingDto } from '../../../../validators';
import { ParentDescriptor, getParentRowSpans } from '../ProbabilityTable/utils';

type StateInfo = {
	name: string;
	issueName: string;
	issueId: string;
};

type PolicyRow = {
	rowKey: string;
	parentStateByIssueId: Record<string, string>;
	optionValues: Record<string, number>;
};

type StateLookups = {
	optionMap: Map<string, StateInfo>;
	outcomeMap: Map<string, StateInfo>;
};

const buildStateLookups = (issues: Issue[]) => {
	const optionMap = new Map<string, StateInfo>();
	const outcomeMap = new Map<string, StateInfo>();

	for (const issue of issues) {
		if (issue.type === 'Decision') {
			for (const option of issue.decision.options) {
				optionMap.set(option.id, {
					name: option.name,
					issueName: issue.name,
					issueId: issue.id,
				});
			}
		}

		if (issue.type === 'Uncertainty') {
			for (const outcome of issue.uncertainty.outcomes) {
				outcomeMap.set(outcome.id, {
					name: outcome.name,
					issueName: issue.name,
					issueId: issue.id,
				});
			}
		}
	}

	return { optionMap, outcomeMap };
};

const findDecisionPolicy = (
	policyTable: PolicyTableDecisionOutgoingDto[],
	decisionKeyCandidates: Set<string>,
	optionIdSet: Set<string>,
) => {
	const directMatch = policyTable.find(table => decisionKeyCandidates.has(table.decision_id));
	if (directMatch) return directMatch;

	return policyTable.find(table =>
		table.rows.some(row => {
			return row.states.some(stateId => optionIdSet.has(stateId));
		}),
	);
};

const addParentState = (
	parentIssueMap: Map<string, ParentDescriptor>,
	parentStateSeenByIssue: Map<string, Set<string>>,
	issueId: string,
	stateId: string,
	kind: 'decision' | 'uncertainty',
	info: StateInfo,
) => {
	const seenStates = parentStateSeenByIssue.get(issueId) ?? new Set<string>();
	if (seenStates.has(stateId)) return;
	seenStates.add(stateId);
	parentStateSeenByIssue.set(issueId, seenStates);

	const existing = parentIssueMap.get(issueId) ?? {
		issueId,
		issueName: info.issueName,
		kind,
		states: [],
	};
	existing.states.push({ id: stateId, name: info.name });

	parentIssueMap.set(issueId, existing);
};

const buildGroupKey = (parentStateByIssueId: Record<string, string>) =>
	Object.entries(parentStateByIssueId)
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([, stateId]) => stateId)
		.join('|');

const sortParents = (parents: ParentDescriptor[]) => {
	const sortedParents = [...parents].sort((a, b) => a.issueName.localeCompare(b.issueName));
	for (const parent of sortedParents) {
		parent.states.sort((a, b) => a.name.localeCompare(b.name));
	}
	return sortedParents;
};

const sortPolicyRows = (rows: PolicyRow[], parents: ParentDescriptor[]) => {
	rows.sort((a, b) => {
		for (const parent of parents) {
			const aStateId = a.parentStateByIssueId[parent.issueId];
			const bStateId = b.parentStateByIssueId[parent.issueId];
			const aIndex = parent.states.findIndex(state => state.id === aStateId);
			const bIndex = parent.states.findIndex(state => state.id === bStateId);
			if (aIndex !== bIndex) return aIndex - bIndex;
		}

		return a.rowKey.localeCompare(b.rowKey);
	});

	return rows;
};

const buildPolicyTableModel = ({
	decisionRows,
	optionIdSet,
	lookups,
}: {
	decisionRows: PolicyTableDecisionOutgoingDto['rows'];
	optionIdSet: Set<string>;
	lookups: StateLookups;
}) => {
	if (!decisionRows.length) {
		return {
			parents: [] as ParentDescriptor[],
			rows: [] as PolicyRow[],
		};
	}
	const parentIssueMap = new Map<string, ParentDescriptor>();
	const parentStateSeenByIssue = new Map<string, Set<string>>();
	const groupedRows = new Map<string, PolicyRow>();

	for (const row of decisionRows) {
		let decisionOptionId = '';
		const parentStateByIssueId: Record<string, string> = {};

		for (const stateId of row.states) {
			if (optionIdSet.has(stateId)) {
				decisionOptionId = stateId;
				continue;
			}

			const optionInfo = lookups.optionMap.get(stateId);
			if (optionInfo) {
				parentStateByIssueId[optionInfo.issueId] = stateId;
				addParentState(
					parentIssueMap,
					parentStateSeenByIssue,
					optionInfo.issueId,
					stateId,
					'decision',
					optionInfo,
				);
				continue;
			}

			const outcomeInfo = lookups.outcomeMap.get(stateId);
			if (outcomeInfo) {
				parentStateByIssueId[outcomeInfo.issueId] = stateId;
				addParentState(
					parentIssueMap,
					parentStateSeenByIssue,
					outcomeInfo.issueId,
					stateId,
					'uncertainty',
					outcomeInfo,
				);
			}
		}

		const groupKey = buildGroupKey(parentStateByIssueId);
		const grouped = groupedRows.get(groupKey) ?? {
			rowKey: groupKey || 'base',
			parentStateByIssueId,
			optionValues: {},
		};

		if (decisionOptionId) {
			grouped.optionValues[decisionOptionId] = row.value;
		}

		groupedRows.set(groupKey, grouped);
	}

	const parentDescriptors = sortParents([...parentIssueMap.values()]);
	const policyRows = sortPolicyRows([...groupedRows.values()], parentDescriptors);

	return {
		parents: parentDescriptors,
		rows: policyRows,
	};
};

export const usePolicyTable = (issue: Issue) => {
	const issues = useSelectedProjectIssues();
	const { policyTable, isFetching } = useGetPolicyTable(issue.project_id);
	const optionIds = issue.decision.options.map(option => option.id);
	const optionIdSet = new Set(optionIds);
	const decisionKeyCandidates = new Set([issue.id, issue.decision.id]);
	const { optionMap, outcomeMap } = buildStateLookups(issues);
	const decisionPolicy = findDecisionPolicy(policyTable, decisionKeyCandidates, optionIdSet);

	const { parents, rows } = useMemo(() => {
		return buildPolicyTableModel({
			decisionRows: decisionPolicy?.rows ?? [],
			optionIdSet,
			lookups: { optionMap, outcomeMap },
		});
	}, [decisionPolicy?.rows, optionIds, issue.id, issue.decision.id, optionMap, outcomeMap]);

	const parentRowSpans = useMemo(() => getParentRowSpans(parents), [parents]);

	return {
		isFetching,
		optionIds,
		parents,
		parentRowSpans,
		rows,
		lookups: { optionMap, outcomeMap },
	};
};
