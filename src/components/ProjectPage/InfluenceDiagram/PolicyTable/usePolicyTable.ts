import { useMemo } from 'react';
import { useGetPolicyTable } from '../../../../hooks/api/useGetPolicyTable';
import { useSelectedProjectIssues } from '../../../../hooks/useSelectedProjectIssues';
import { Issue } from '../../../../validators';
import { ParentDescriptor, getParentRowSpans } from '../ProbabilityTable/utils';

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

export const usePolicyTable = (issue: Issue) => {
	const issues = useSelectedProjectIssues();
	const { policyTable, isFetching } = useGetPolicyTable(issue.project_id);
	const decisionKeyCandidates = useMemo(
		() => new Set([issue.id, issue.decision.id]),
		[issue.id, issue.decision.id],
	);

	const optionMap = useMemo(() => {
		const map = new Map<string, { name: string; issueName: string; issueId: string }>();
		for (const iss of issues) {
			if (iss.type !== 'Decision') continue;
			for (const option of iss.decision.options) {
				map.set(option.id, {
					name: option.name,
					issueName: iss.name,
					issueId: iss.id,
				});
			}
		}
		return map;
	}, [issues]);

	const outcomeMap = useMemo(() => {
		const map = new Map<string, { name: string; issueName: string; issueId: string }>();
		for (const iss of issues) {
			if (iss.type !== 'Uncertainty') continue;
			for (const outcome of iss.uncertainty.outcomes) {
				map.set(outcome.id, {
					name: outcome.name,
					issueName: iss.name,
					issueId: iss.id,
				});
			}
		}
		return map;
	}, [issues]);

	const decisionPolicy = useMemo(() => {
		const directMatch = policyTable.find(table => decisionKeyCandidates.has(table.decision_id));
		if (directMatch) return directMatch;

		// Fallback: infer owning decision from state keys when decision_id points to a different identifier.
		return policyTable.find(table =>
			table.rows.some(row =>
				Object.keys(row.states).some(stateKey =>
					decisionKeyCandidates.has(getIssueIdFromStateKey(stateKey)),
				),
			),
		);
	}, [policyTable, decisionKeyCandidates]);

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
					const existing = parentIssueMap.get(issueId) ?? {
						issueId,
						issueName: optionInfo.issueName,
						kind: 'decision' as const,
						states: [],
					};
					if (!existing.states.find(state => state.id === stateId)) {
						existing.states.push({ id: stateId, name: optionInfo.name });
					}
					parentIssueMap.set(issueId, existing);
					continue;
				}

				const outcomeInfo = outcomeMap.get(stateId);
				if (outcomeInfo) {
					const existing = parentIssueMap.get(issueId) ?? {
						issueId,
						issueName: outcomeInfo.issueName,
						kind: 'uncertainty' as const,
						states: [],
					};
					if (!existing.states.find(state => state.id === stateId)) {
						existing.states.push({ id: stateId, name: outcomeInfo.name });
					}
					parentIssueMap.set(issueId, existing);
				}
			}

			const groupKey = Object.entries(parentStateByIssueId)
				.sort(([a], [b]) => a.localeCompare(b))
				.map(([, stateId]) => stateId)
				.join('|');

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

		const parentDescriptors = [...parentIssueMap.values()].sort((a, b) =>
			a.issueName.localeCompare(b.issueName),
		);

		for (const parent of parentDescriptors) {
			parent.states.sort((a, b) => a.name.localeCompare(b.name));
		}

		const policyRows = [...groupedRows.values()];
		policyRows.sort((a, b) => {
			for (const parent of parentDescriptors) {
				const aStateId = a.parentStateByIssueId[parent.issueId];
				const bStateId = b.parentStateByIssueId[parent.issueId];
				const aIndex = parent.states.findIndex(state => state.id === aStateId);
				const bIndex = parent.states.findIndex(state => state.id === bStateId);
				if (aIndex !== bIndex) return aIndex - bIndex;
			}
			return a.rowKey.localeCompare(b.rowKey);
		});

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
