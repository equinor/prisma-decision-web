import { describe, expect, it } from 'vitest';
import { buildDisplayRows, getGroupKey } from './probabilityTableTree';

const states = [
	['Yes', 'No'],
	['Weak', 'Strong'],
	['Small', 'Medium', 'Large'],
];
const configurations = states[0].flatMap(a =>
	states[1].flatMap(b =>
		states[2].map(c => ({ key: `${a}-${b}-${c}`, path: [a, b, c], labels: [a, b, c] })),
	),
);

describe('buildDisplayRows', () => {
	it('shows every configuration when nothing is collapsed, with tree row spans', () => {
		const rows = buildDisplayRows(configurations, 3, new Set());
		expect(rows).toHaveLength(12);
		expect(rows[0].parentCells.map(cell => [cell.label, cell.rowSpan])).toEqual([
			['Yes', 6],
			['Weak', 3],
			['Small', 1],
		]);
		expect(rows[1].parentCells.map(cell => cell.label)).toEqual(['Medium']);
		expect(rows[3].parentCells.map(cell => cell.label)).toEqual(['Strong', 'Small']);
	});

	it('draws dividers between groups but not between leaf states', () => {
		const rows = buildDisplayRows(configurations, 3, new Set());
		expect(rows.map(row => row.divider)).toEqual([
			false,
			false,
			false,
			true,
			false,
			false,
			true,
			false,
			false,
			true,
			false,
			false,
		]);
	});

	it('merges a collapsed group into one row and keeps the outer span', () => {
		const rows = buildDisplayRows(configurations, 3, new Set([getGroupKey(['No', 'Weak'], 1)]));
		expect(rows).toHaveLength(10);
		const group = rows[6];
		expect(group.configurations).toHaveLength(3);
		expect(group.summaryColSpan).toBe(1);
		expect(group.parentCells.map(cell => [cell.label, cell.rowSpan, cell.collapsed])).toEqual([
			['No', 4, false],
			['Weak', 1, true],
		]);
		expect(rows[7].divider).toBe(true);
	});

	it('collapses a group of groups and ignores inner collapsed state', () => {
		const rows = buildDisplayRows(
			configurations,
			3,
			new Set([getGroupKey(['Yes'], 0), getGroupKey(['Yes', 'Weak'], 1)]),
		);
		expect(rows).toHaveLength(7);
		expect(rows[0].configurations).toHaveLength(6);
		expect(rows[0].summaryColSpan).toBe(2);
		expect(rows[0].parentCells).toEqual([
			expect.objectContaining({ label: 'Yes', rowSpan: 1, collapsed: true }),
		]);
		expect(rows[1].divider).toBe(true);
	});

	it('does not offer grouping on the last parent column', () => {
		const rows = buildDisplayRows(configurations, 3, new Set());
		expect(rows[0].parentCells[2].groupKey).toBeUndefined();
		const single = buildDisplayRows(
			[{ key: 'a', path: ['A'], labels: ['A'] }],
			1,
			new Set([getGroupKey(['A'], 0)]),
		);
		expect(single[0].configurations).toHaveLength(1);
		expect(single[0].parentCells[0].groupKey).toBeUndefined();
	});
});
