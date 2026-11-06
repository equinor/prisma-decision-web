import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { RestrictionEntry } from '../../../../validators';
import { RestrictionToggleCell } from './RestrictionToggleCell';
import { RestrictionToggleViolation } from './useRestrictionToggle';

const parentState = { id: 'parent-state', name: 'Parent option', isUncertainty: false };
const childState = { id: 'child-state', name: 'Child outcome', isUncertainty: true };
const entry: RestrictionEntry = {
	id: 'restriction-entry',
	created_at: '2026-11-05T12:00:00Z',
	updated_at: '2026-11-05T12:00:00Z',
	restriction_value: 1,
	parent_state_id: parentState.id,
	is_parent_uncertainty: parentState.isUncertainty,
	child_state_id: childState.id,
	is_child_uncertainty: childState.isUncertainty,
	restriction_table_id: 'restriction-table',
};

const renderCell = (
	entry: RestrictionEntry | undefined,
	violation?: RestrictionToggleViolation,
) => {
	const onToggle = vi.fn();
	render(
		<table>
			<tbody>
				<tr>
					<RestrictionToggleCell
						entry={entry}
						parentState={parentState}
						childState={childState}
						onToggle={onToggle}
						violation={violation}
					/>
				</tr>
			</tbody>
		</table>,
	);
	return onToggle;
};

test('delegates an allowed toggle to the validated restriction handler', async () => {
	const user = userEvent.setup();
	const onToggle = renderCell(entry);
	const toggle = screen.getByRole('switch', { name: 'Parent option allows Child outcome' });

	expect(toggle).toBeChecked();
	await user.click(toggle);

	expect(onToggle).toHaveBeenCalledExactlyOnceWith({
		entry,
		parentStateName: parentState.name,
		childStateName: childState.name,
	});
});

test('locks a toggle that would fully restrict a row and explains the violation', async () => {
	const user = userEvent.setup();
	const message = 'Parent option must allow at least one outcome.';
	const onToggle = renderCell(entry, { message, blocksToggle: true });
	const toggle = screen.getByRole('switch', { name: 'Parent option allows Child outcome' });

	expect(toggle).toBeChecked();
	expect(toggle).toBeDisabled();
	await user.click(toggle);
	expect(onToggle).not.toHaveBeenCalled();

	await user.hover(screen.getByRole('img', { name: 'Restriction not allowed' }));
	expect(await screen.findByRole('tooltip')).toHaveTextContent(message);
});

test('allows repairing an existing invalid restriction', async () => {
	const user = userEvent.setup();
	const restrictedEntry = { ...entry, restriction_value: 0 };
	const onToggle = renderCell(restrictedEntry, {
		message: 'This row is already fully restricted.',
		blocksToggle: false,
	});
	const toggle = screen.getByRole('switch', { name: 'Parent option allows Child outcome' });

	expect(toggle).not.toBeChecked();
	expect(toggle).toBeEnabled();
	expect(screen.getByRole('img', { name: 'Invalid restriction' })).toBeInTheDocument();
	await user.click(toggle);

	expect(onToggle).toHaveBeenCalledExactlyOnceWith({
		entry: restrictedEntry,
		parentStateName: parentState.name,
		childStateName: childState.name,
	});
});

test('disables the toggle when its restriction entry is missing', async () => {
	const user = userEvent.setup();
	const onToggle = renderCell(undefined);
	const toggle = screen.getByRole('switch', { name: 'Parent option allows Child outcome' });

	expect(toggle).toBeDisabled();
	await user.click(toggle);
	expect(onToggle).not.toHaveBeenCalled();
});
