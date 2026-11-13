import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { ConditionalTable } from './ConditionalTable';

test('leaves the next TextField input transparent inside its outlined container', () => {
	render(
		<table>
			<tbody>
				<tr>
					<ConditionalTable.NumberCell id='cell' value={0.5} onCommit={() => {}} />
				</tr>
			</tbody>
		</table>,
	);

	const input = screen.getByRole('spinbutton');
	const textField = input.closest('.eds-text-field');

	expect(textField).not.toBeNull();
	expect(textField?.className).not.toContain('[&_input]:bg-background-default!');
});

test('disables only the cells listed as restricted', () => {
	render(
		<ConditionalTable
			parents={[]}
			lookups={{ optionMap: new Map(), outcomeMap: new Map() }}
			rows={[]}
			restrictedCells={['restricted']}
		>
			<ConditionalTable.Body>
				<ConditionalTable.Row>
					<ConditionalTable.NumberCell id='restricted' value={0} onCommit={() => {}} />
					<ConditionalTable.NumberCell id='free' value={0} onCommit={() => {}} />
				</ConditionalTable.Row>
			</ConditionalTable.Body>
		</ConditionalTable>,
	);

	const [restricted, free] = screen.getAllByRole('spinbutton');
	expect(restricted).toBeDisabled();
	expect(free).toBeEnabled();
});
