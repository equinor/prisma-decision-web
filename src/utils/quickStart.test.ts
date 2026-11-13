import { expect, test } from 'vitest';
import type { ChatDiagram } from './diagramInformation';
import { getDefaultProjectValues } from './projectDefaults';
import { getQuickStartRecords, type QuickStartResponse } from './quickStart';

test('the created project keeps the approved probability tables, not only the connections', () => {
	const diagram: ChatDiagram = {
		edges: [{ tail_issue_name: 'Weather', head_issue_name: 'Value' }],
		discrete_probabilities: ['Dry', 'Wet', 'Windy'].map(outcome_name => ({
			uncertainty_name: 'Weather',
			outcome_name,
			probability: 1 / 3,
			parent_states: [],
		})),
		discrete_utilities: [],
	};
	const response = {
		state: {
			project: {
				project_information: {
					project_name: 'Event',
					opportunity_statement: 'Plan the event.',
					end_date: null,
					public_project: false,
				},
				objectives: {
					objectives: [{ name: 'Profit', type: 'Fundamental', description: 'Earn' }],
				},
				issues: {
					issues: [
						{
							name: 'Weather',
							description: 'Event weather',
							type: 'Uncertainty',
							boundary: 'in',
							decision: null,
							uncertainty: {
								is_key: true,
								outcomes: ['Dry', 'Wet', 'Windy'].map(name => ({
									name,
									utility: 0,
								})),
							},
						},
					],
				},
				strategies: { strategies: [] },
				influence_diagram: diagram,
			},
		},
	} as unknown as QuickStartResponse;

	expect(getQuickStartRecords(response, getDefaultProjectValues()).diagram).toEqual(diagram);
});
