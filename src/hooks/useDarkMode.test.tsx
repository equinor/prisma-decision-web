import { act, renderHook } from '@testing-library/react';
import { afterEach, expect, test } from 'vitest';
import useDarkMode from './useDarkMode';

afterEach(() => {
	localStorage.removeItem('useDarkMode');
	document.documentElement.classList.remove('dark');
	delete document.documentElement.dataset.colorScheme;
	document.documentElement.style.colorScheme = '';
});

test('keeps EDS beta color tokens in sync with the existing theme toggle', () => {
	const { result } = renderHook(useDarkMode);
	expect(document.documentElement).toHaveAttribute('data-color-scheme', 'light');
	act(() => result.current.toggleDarkMode());
	expect(document.documentElement).toHaveClass('dark');
	expect(document.documentElement).toHaveAttribute('data-color-scheme', 'dark');
	act(() => result.current.toggleDarkMode());
	expect(document.documentElement).not.toHaveClass('dark');
	expect(document.documentElement).toHaveAttribute('data-color-scheme', 'light');
});

test('restores the saved dark preference for beta components', () => {
	localStorage.setItem('useDarkMode', 'true');
	renderHook(useDarkMode);
	expect(document.documentElement).toHaveClass('dark');
	expect(document.documentElement).toHaveAttribute('data-color-scheme', 'dark');
});
