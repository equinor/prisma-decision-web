import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { useState } from 'react';
import { expect, test, vi } from 'vitest';
import { activeToolAtom } from '../../ProjectPage/Whiteboard/activeToolAtom';
import { TogglePanMode } from './TogglePanMode';
import { ToggleSelectionMode } from './ToggleSelectionMode';
import { ToggleRectangleMode } from './ToggleRectangleMode';
import { ToggleArrowMode } from './ToggleArrowMode';
import { ToggleTextMode } from './ToggleTextMode';
import { ToggleFreehandMode } from './ToggleFreehandMode';
import {
	Toolbar,
	ToolbarButton,
	ToolbarPopoverButton,
	ToolbarToggleButton,
	ToolbarToolButton,
	ToolbarToolGroup,
} from './Toolbar';

test('supports grey and blue tones independently of button behavior', () => {
	render(
		<>
			<ToolbarButton>Default action</ToolbarButton>
			<ToolbarButton tone='neutral'>Grey action</ToolbarButton>
			<ToolbarButton tone='accent'>Blue action</ToolbarButton>
			<ToolbarToggleButton tone='accent' pressed onPressedChange={vi.fn()}>
				Blue toggle
			</ToolbarToggleButton>
			<ToolbarPopoverButton tone='accent' trigger='Blue popover'>
				Settings
			</ToolbarPopoverButton>
			<ToolbarToolButton selected>Default tool</ToolbarToolButton>
			<ToolbarToolButton tone='neutral' selected={false}>
				Grey tool
			</ToolbarToolButton>
			<ToolbarButton tone='accent' disabled>
				Disabled action
			</ToolbarButton>
		</>,
	);

	for (const name of ['Default action', 'Grey action', 'Disabled action']) {
		expect(screen.getByRole('button', { name })).toHaveAttribute(
			'data-color-appearance',
			'neutral',
		);
	}
	for (const name of ['Blue action', 'Blue toggle', 'Blue popover']) {
		expect(screen.getByRole('button', { name })).toHaveAttribute(
			'data-color-appearance',
			'accent',
		);
	}
	expect(screen.getByRole('radio', { name: 'Default tool' })).toHaveAttribute(
		'data-color-appearance',
		'accent',
	);
	expect(screen.getByRole('radio', { name: 'Grey tool' })).toHaveAttribute(
		'data-color-appearance',
		'neutral',
	);
});

test('exposes toggle and mutually exclusive tool states', () => {
	render(
		<Toolbar aria-label='Test toolbar'>
			<ToolbarToggleButton pressed onPressedChange={vi.fn()}>
				Visibility
			</ToolbarToggleButton>
			<ToolbarToolGroup aria-label='Tools'>
				<ToolbarToolButton selected shortcut='1'>
					Pan
				</ToolbarToolButton>
				<ToolbarToolButton selected={false}>Selection</ToolbarToolButton>
			</ToolbarToolGroup>
		</Toolbar>,
	);

	expect(screen.getByRole('toolbar', { name: 'Test toolbar' })).toBeInTheDocument();
	expect(screen.getByRole('button', { name: 'Visibility' })).toHaveAttribute(
		'aria-pressed',
		'true',
	);
	expect(screen.getByRole('radiogroup', { name: 'Tools' })).toBeInTheDocument();
	expect(screen.getByRole('radio', { name: 'Pan' })).toHaveAttribute('aria-checked', 'true');
	expect(screen.getByRole('radio', { name: 'Selection' })).toHaveAttribute(
		'aria-checked',
		'false',
	);
	expect(screen.getByText('1')).toHaveAttribute('aria-hidden', 'true');
});

test('owns popover open state and exposes it on the trigger', async () => {
	const user = userEvent.setup();
	render(
		<ToolbarPopoverButton trigger='Layout controls'>
			<button>Layout settings</button>
		</ToolbarPopoverButton>,
	);

	const trigger = screen.getByRole('button', { name: 'Layout controls' });
	expect(trigger).toHaveAttribute('aria-expanded', 'false');

	await user.click(trigger);

	expect(trigger).toHaveAttribute('aria-expanded', 'true');
	expect(screen.getByRole('dialog', { name: 'Layout controls' })).toHaveAttribute(
		'id',
		trigger.getAttribute('aria-controls'),
	);
	await waitFor(() =>
		expect(screen.getByRole('button', { name: 'Layout settings' })).toHaveFocus(),
	);

	await user.keyboard('{Escape}');

	expect(trigger).toHaveAttribute('aria-expanded', 'false');
	await waitFor(() => expect(trigger).toHaveFocus());
});

test('supports controlled toggle changes and native disabled behavior', async () => {
	const user = userEvent.setup();
	const onDisabledChange = vi.fn();
	const Toggle = () => {
		const [pressed, setPressed] = useState(false);
		return (
			<>
				<ToolbarToggleButton pressed={pressed} onPressedChange={setPressed}>
					Visibility
				</ToolbarToggleButton>
				<ToolbarToggleButton pressed={false} disabled onPressedChange={onDisabledChange}>
					Disabled toggle
				</ToolbarToggleButton>
			</>
		);
	};
	render(<Toggle />);
	const toggle = screen.getByRole('button', { name: 'Visibility' });
	await user.click(toggle);
	expect(toggle).toHaveAttribute('aria-pressed', 'true');
	await user.keyboard(' ');
	expect(toggle).toHaveAttribute('aria-pressed', 'false');
	await user.click(screen.getByRole('button', { name: 'Disabled toggle' }));
	expect(onDisabledChange).not.toHaveBeenCalled();
});

test('supports controlled popovers, outside dismissal, and focus restoration', async () => {
	const user = userEvent.setup();
	const Controlled = () => {
		const [open, setOpen] = useState(false);
		return (
			<>
				<ToolbarPopoverButton open={open} onOpenChange={setOpen} trigger='Create Issue'>
					<button onClick={() => setOpen(false)}>Complete</button>
				</ToolbarPopoverButton>
				<button>Outside</button>
			</>
		);
	};
	render(<Controlled />);
	const trigger = screen.getByRole('button', { name: 'Create Issue' });
	const outside = screen.getByRole('button', { name: 'Outside' });
	await user.click(trigger);
	await user.click(screen.getByRole('button', { name: 'Complete' }));
	expect(trigger).toHaveAttribute('aria-expanded', 'false');
	await waitFor(() => expect(trigger).toHaveFocus());
	await user.click(trigger);
	await user.click(outside);
	expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('provides icon button labels and tooltips on hover and keyboard focus', async () => {
	const user = userEvent.setup();
	const showPopover = vi.spyOn(HTMLElement.prototype, 'showPopover');
	render(
		<ToolbarButton icon tooltip='Zoom in'>
			<svg aria-hidden='true' />
		</ToolbarButton>,
	);
	const button = screen.getByRole('button', { name: 'Zoom in' });
	expect(button).toHaveAccessibleDescription('Zoom in');
	await user.hover(button);
	expect(showPopover.mock.contexts.at(-1)).toBe(screen.getByRole('tooltip', { name: 'Zoom in' }));
	fireEvent.focus(button);
	expect(showPopover.mock.contexts.at(-1)).toBe(screen.getByRole('tooltip', { name: 'Zoom in' }));
	showPopover.mockRestore();
});

test('preserves Whiteboard tool-mode clicks, shortcuts, and mutual exclusion', async () => {
	const user = userEvent.setup();
	const store = createStore();
	render(
		<Provider store={store}>
			<Toolbar aria-label='Whiteboard toolbar'>
				<ToolbarToolGroup aria-label='Tools'>
					<TogglePanMode />
					<ToggleSelectionMode />
					<ToggleRectangleMode />
					<ToggleArrowMode />
					<ToggleTextMode />
					<ToggleFreehandMode />
				</ToolbarToolGroup>
			</Toolbar>
			<input aria-label='Editing text' />
		</Provider>,
	);
	const pan = screen.getByRole('radio', { name: 'Pan mode' });
	expect(pan).toHaveAttribute('aria-checked', 'true');
	await user.click(screen.getByRole('radio', { name: 'Rectangle mode' }));
	expect(store.get(activeToolAtom)).toBe('rectangle');
	await user.click(screen.getByRole('radio', { name: 'Rectangle mode' }));
	expect(store.get(activeToolAtom)).toBe('pan');
	await user.click(pan);
	expect(store.get(activeToolAtom)).toBe('selection');
	for (const [key, mode] of [
		['1', 'pan'],
		['2', 'rectangle'],
		['3', 'arrow'],
		['4', 'text'],
		['5', 'freehand'],
	]) {
		await user.keyboard(key);
		expect(store.get(activeToolAtom)).toBe(mode);
		expect(
			screen
				.getAllByRole('radio')
				.filter(button => button.getAttribute('aria-checked') === 'true'),
		).toHaveLength(1);
	}
	await user.click(screen.getByRole('textbox', { name: 'Editing text' }));
	await user.type(screen.getByRole('textbox', { name: 'Editing text' }), '12345');
	expect(store.get(activeToolAtom)).toBe('freehand');
});

test('uses Ariakit navigation without changing the active tool', async () => {
	const user = userEvent.setup();
	const store = createStore();
	render(
		<Provider store={store}>
			<Toolbar aria-label='Whiteboard toolbar'>
				<ToolbarToolGroup aria-label='Tools'>
					<TogglePanMode />
					<ToggleSelectionMode />
					<ToggleRectangleMode />
				</ToolbarToolGroup>
			</Toolbar>
		</Provider>,
	);
	await user.tab();
	expect(screen.getByRole('radio', { name: 'Pan mode' })).toHaveFocus();
	for (const [key, name] of [
		['ArrowRight', 'Selection mode'],
		['ArrowRight', 'Rectangle mode'],
		['ArrowRight', 'Pan mode'],
		['End', 'Rectangle mode'],
		['Home', 'Pan mode'],
	]) {
		await user.keyboard(`{${key}}`);
		expect(screen.getByRole('radio', { name })).toHaveFocus();
		expect(store.get(activeToolAtom)).toBe('pan');
	}
});
