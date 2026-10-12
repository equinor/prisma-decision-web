import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm, useWatch } from 'react-hook-form';
import { expect, test, vi } from 'vitest';
import { SegmentedSelector } from './SegmentedSelector';

type FormValues = { boundary: 'in' | 'on' | 'out' };

const options = [
	{ value: 'in', label: 'In' },
	{ value: 'on', label: 'On' },
	{ value: 'out', label: 'Out' },
] as const;

const RegisteredSelector = ({
	onSubmit,
	controlled,
}: {
	onSubmit: (values: FormValues) => void;
	controlled: boolean;
}) => {
	const { register, control, handleSubmit, reset, formState } = useForm<FormValues>({
		defaultValues: { boundary: 'in' },
	});
	const boundary = useWatch({ control, name: 'boundary' });
	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<SegmentedSelector
				label='Boundary'
				{...register('boundary')}
				{...(controlled ? { value: boundary } : {})}
				options={options}
			/>
			<output aria-label='Touched'>{String(!!formState.touchedFields.boundary)}</output>
			<button type='submit'>Submit</button>
			<button type='button' onClick={() => reset({ boundary: 'in' })}>
				Reset
			</button>
		</form>
	);
};

test.each([true, false])('supports register with controlled=%s', async controlled => {
	const user = userEvent.setup();
	const onSubmit = vi.fn();
	render(<RegisteredSelector onSubmit={onSubmit} controlled={controlled} />);
	expect(screen.getByRole('radio', { name: 'In' })).toBeChecked();
	await user.click(screen.getByRole('radio', { name: 'On' }));
	await user.keyboard('{ArrowRight}');
	expect(screen.getByRole('radio', { name: 'Out' })).toBeChecked();
	expect(screen.getByRole('radio', { name: 'Out' })).toHaveFocus();
	await user.click(screen.getByRole('button', { name: 'Submit' }));
	await waitFor(() =>
		expect(onSubmit).toHaveBeenCalledWith({ boundary: 'out' }, expect.anything()),
	);
	expect(screen.getByLabelText('Touched')).toHaveTextContent('true');
	await user.click(screen.getByRole('button', { name: 'Reset' }));
	expect(screen.getByRole('radio', { name: 'In' })).toBeChecked();
	expect(screen.getByRole('radio', { name: 'Out' })).not.toBeChecked();
});

test('gives each option its own tooltip on hover and keyboard focus', async () => {
	const user = userEvent.setup();
	const showPopover = vi.spyOn(HTMLElement.prototype, 'showPopover');
	render(
		<SegmentedSelector
			label='Boundary'
			name='boundary'
			options={options.map(option => ({ ...option, tooltip: `Boundary: ${option.label}` }))}
		/>,
	);
	const inside = screen.getByRole('radio', { name: 'In' });
	const outside = screen.getByRole('radio', { name: 'Out' });
	expect(inside).toHaveAccessibleDescription('Boundary: In');
	expect(outside).toHaveAccessibleDescription('Boundary: Out');
	await user.hover(screen.getByText('In'));
	expect(showPopover.mock.contexts.at(-1)).toBe(
		screen.getByRole('tooltip', { name: 'Boundary: In' }),
	);
	fireEvent.focus(outside);
	expect(showPopover.mock.contexts.at(-1)).toBe(
		screen.getByRole('tooltip', { name: 'Boundary: Out' }),
	);
	showPopover.mockRestore();
});
