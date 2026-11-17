import { act, renderHook } from '@testing-library/react';
import { expect, test } from 'vitest';
import { useProbabilityTableSettings } from './useProbabilityTableSettings';

test('every open copy of a table sees the same settings', () => {
	const first = renderHook(() => useProbabilityTableSettings('issue-sync'));
	const second = renderHook(() => useProbabilityTableSettings('issue-sync'));

	act(() => first.result.current[1](previous => ({ ...previous, locks: { row: ['outcome'] } })));

	expect(second.result.current[0].locks).toEqual({ row: ['outcome'] });
	expect(JSON.parse(localStorage.getItem('probability-table:issue-sync')!).locks).toEqual({
		row: ['outcome'],
	});
});
