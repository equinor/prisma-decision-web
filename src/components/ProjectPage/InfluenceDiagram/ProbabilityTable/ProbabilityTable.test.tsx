import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { existingIssue, project } from '../../../../test/issueFixtures';
import { Issue } from '../../../../validators';
import { ProjectContext } from '../../ProjectContext';
import { ProbabilityConditionalTable } from './ProbabilityTable';

test('disables restricted probabilities and accepts a fully restricted row without a sum of 1', () => {
	const issue: Issue = { ...existingIssue(), type: 'Uncertainty' };
	const [outcome] = issue.uncertainty.outcomes;
	const base = existingIssue();
	const [option] = base.decision.options;
	const parent: Issue = {
		...base,
		id: 'parent',
		name: 'Parent decision',
		node: { ...base.node, id: 'parent-node', issue_id: 'parent' },
		decision: {
			...base.decision,
			options: [
				{ ...option, id: 'allowed', name: 'Allowed option' },
				{ ...option, id: 'restricted', name: 'Restricted option' },
			],
		},
	};
	const timestamp = '2026-11-11T12:00:00.000Z';
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false, staleTime: Infinity } },
	});
	client.setQueryData(['issues'], [parent, issue]);
	client.setQueryData(
		['edges'],
		[{ id: 'edge', project_id: project.id, tail_id: parent.node.id, head_id: issue.node.id }],
	);
	client.setQueryData(
		['restrictionTables'],
		[
			{
				id: 'table',
				edge_id: 'edge',
				project_id: project.id,
				name: 'Parent decision to Existing issue',
				created_at: timestamp,
				updated_at: timestamp,
				restriction_entries: [
					{
						id: 'entry',
						restriction_table_id: 'table',
						created_at: timestamp,
						updated_at: timestamp,
						parent_state_id: 'restricted',
						child_state_id: outcome.id,
						is_parent_uncertainty: false,
						is_child_uncertainty: true,
						restriction_value: 0,
					},
				],
			},
		],
	);
	client.setQueryData(
		['probabilityTables'],
		parent.decision.options.map(option => ({
			id: `probability-${option.id}`,
			outcome_id: outcome.id,
			uncertainty_id: issue.uncertainty.id,
			project_id: project.id,
			parent_option_ids: [option.id],
			parent_outcome_ids: [],
			probability: 0.4,
		})),
	);

	render(
		<QueryClientProvider client={client}>
			<ProjectContext value={project}>
				<ProbabilityConditionalTable issue={issue} />
			</ProjectContext>
		</QueryClientProvider>,
	);

	const [allowed, restricted] = screen.getAllByRole('spinbutton');
	expect(allowed).toBeEnabled();
	expect(restricted).toBeDisabled();
	expect(screen.getAllByRole('cell', { name: /∑/ }).map(cell => cell.textContent)).toEqual([
		'∑≠1',
		'∑=1',
	]);
});
