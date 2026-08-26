import { useMemo } from 'react';
import { useGetPolicyTable } from '../../../../hooks/api/useGetPolicyTable';
import { useSelectedProjectIssues } from '../../../../hooks/useSelectedProjectIssues';
import { Issue, PolicyTableDecision } from '../../../../validators';
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

type OptionContext = {
	optionIds: string[];
	decisionKeyCandidates: Set<string>;
};

const buildOptionContext = (issue: Issue): OptionContext => {
	const optionIds = issue.decision.options.map(option => option.id);
	return {
		optionIds,
		decisionKeyCandidates: new Set([issue.id, issue.decision.id]),
	};
};

const resolveDecisionOptionId = (row: PolicyTableDecision['rows'][number], optionIds: string[]) => {
	if (optionIds.includes(row.option_id)) return row.option_id;
	return row.states.find(stateId => optionIds.includes(stateId)) ?? '';
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
	policyTable: PolicyTableDecision[],
	decisionKeyCandidates: Set<string>,
	optionIds: string[],
) => {
	const directMatch = policyTable.find(table => decisionKeyCandidates.has(table.decision_id));
	if (directMatch) return directMatch;

	return policyTable.find(table =>
		table.rows.some(row => {
			if (optionIds.includes(row.option_id)) return true;
			return row.states.some(stateId => optionIds.includes(stateId));
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
	optionIds,
	lookups,
}: {
	decisionRows: PolicyTableDecision['rows'];
	optionIds: string[];
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
		const decisionOptionId = resolveDecisionOptionId(row, optionIds);
		const parentStateByIssueId: Record<string, string> = {};

		for (const stateId of row.states) {
			if (optionIds.includes(stateId)) continue;

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
	const { policyTable, isFetching } = useGetPolicyTable();
	const { optionIds, decisionKeyCandidates } = useMemo(
		() => buildOptionContext(issue),
		[issue.id, issue.decision.id, issue.decision.options],
	);
	const { optionMap, outcomeMap } = buildStateLookups(issues);
	const decisionPolicy = findDecisionPolicy(policyTable, decisionKeyCandidates, optionIds);

	const { parents, rows } = useMemo(() => {
		return buildPolicyTableModel({
			decisionRows: decisionPolicy?.rows ?? [],
			optionIds,
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
