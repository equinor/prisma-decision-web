import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { DiscreteProbabilityCell } from './DiscreteProbabilityCell';

vi.mock('../../../../hooks/api/useUpdateDiscreteProbabilities', () => ({
	useUpdateDiscreteProbabilities: () => ({ mutate: vi.fn() }),
}));

test('leaves the next TextField input transparent inside its outlined container', () => {
	render(
		<table>
			<tbody>
				<tr>
					<DiscreteProbabilityCell
						outcomeId='00000000-0000-4000-8000-000000000002'
						probabilities={[
							{
								id: '00000000-0000-4000-8000-000000000001',
								outcome_id: '00000000-0000-4000-8000-000000000002',
								parent_option_ids: [],
								parent_outcome_ids: [],
								probability: 0.5,
								uncertainty_id: '00000000-0000-4000-8000-000000000003',
								project_id: '00000000-0000-4000-8000-000000000004',
							},
						]}
					/>
				</tr>
			</tbody>
		</table>,
	);

	const input = screen.getByRole('spinbutton');
	const textField = input.closest('.eds-text-field');

	expect(textField).not.toBeNull();
	expect(textField?.className).not.toContain('[&_input]:bg-background-default!');
});
