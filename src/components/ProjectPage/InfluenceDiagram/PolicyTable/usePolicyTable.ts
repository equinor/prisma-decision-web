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

const getIssueIdFromStateKey = (stateKey: string): string => {
	const separatorIndex = stateKey.indexOf(':');
	if (separatorIndex < 0) return stateKey;
	return stateKey.slice(0, separatorIndex);
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
) => {
	const directMatch = policyTable.find(table => decisionKeyCandidates.has(table.decision_id));
	if (directMatch) return directMatch;

	return policyTable.find(table =>
		table.rows.some(row =>
			Object.keys(row.states).some(stateKey =>
				decisionKeyCandidates.has(getIssueIdFromStateKey(stateKey)),
			),
		),
	);
};

const addParentState = (
	parentIssueMap: Map<string, ParentDescriptor>,
	issueId: string,
	stateId: string,
	kind: 'decision' | 'uncertainty',
	info: StateInfo,
) => {
	const existing = parentIssueMap.get(issueId) ?? {
		issueId,
		issueName: info.issueName,
		kind,
		states: [],
	};

	if (!existing.states.find(state => state.id === stateId)) {
		existing.states.push({ id: stateId, name: info.name });
	}

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

export const usePolicyTable = (issue: Issue) => {
	const issues = useSelectedProjectIssues();
	const { policyTable, isFetching } = useGetPolicyTable(issue.project_id);
	const decisionKeyCandidates = useMemo(
		() => new Set([issue.id, issue.decision.id]),
		[issue.id, issue.decision.id],
	);

	const { optionMap, outcomeMap } = useMemo(() => buildStateLookups(issues), [issues]);

	const decisionPolicy = useMemo(
		() => findDecisionPolicy(policyTable, decisionKeyCandidates),
		[policyTable, decisionKeyCandidates],
	);

	const optionIds = useMemo(
		() => issue.decision.options.map(option => option.id),
		[issue.decision.options],
	);

	const { parents, rows } = useMemo(() => {
		if (!decisionPolicy?.rows.length) {
			return {
				parents: [] as ParentDescriptor[],
				rows: [] as PolicyRow[],
			};
		}

		const parentIssueMap = new Map<string, ParentDescriptor>();
		const groupedRows = new Map<string, PolicyRow>();

		for (const row of decisionPolicy.rows) {
			let decisionOptionId = '';
			const parentStateByIssueId: Record<string, string> = {};

			for (const [stateKey, stateId] of Object.entries(row.states)) {
				const issueId = getIssueIdFromStateKey(stateKey);
				if (decisionKeyCandidates.has(issueId)) {
					decisionOptionId = stateId;
					continue;
				}

				parentStateByIssueId[issueId] = stateId;

				const optionInfo = optionMap.get(stateId);
				if (optionInfo) {
					addParentState(parentIssueMap, issueId, stateId, 'decision', optionInfo);
					continue;
				}

				const outcomeInfo = outcomeMap.get(stateId);
				if (outcomeInfo) {
					addParentState(parentIssueMap, issueId, stateId, 'uncertainty', outcomeInfo);
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
	}, [decisionPolicy?.rows, decisionKeyCandidates, optionMap, outcomeMap]);

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
