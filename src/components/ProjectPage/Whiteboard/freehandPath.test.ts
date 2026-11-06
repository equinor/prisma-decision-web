import { expect, test, vi } from 'vitest';
import {
	createFreehandGeometry,
	FreehandInputPoint,
	getFreehandStrokePath,
	scaleFreehandPath,
} from './freehandPath';

const strokes: FreehandInputPoint[][] = [
	[
		[0, 0],
		[60, 0],
		[120, 0],
	],
	[
		[0, 0],
		[30, 40],
		[60, -20],
		[90, 40],
		[120, 0],
	],
];

test.each(strokes.map(points => ({ points })))(
	'stores one open stroke instead of a closed outline',
	({ points }) => {
		const geometry = createFreehandGeometry(points);
		const lastPoint = points[points.length - 1];

		expect(geometry.path.match(/M/g)).toHaveLength(1);
		expect(geometry.path).not.toMatch(/Z/i);
		expect(
			geometry.path.endsWith(
				`L${(lastPoint[0] - geometry.position.x).toFixed(2)},${(lastPoint[1] - geometry.position.y).toFixed(2)}`,
			),
		).toBe(true);
		expect(geometry.width).toBeGreaterThan(0);
		expect(geometry.height).toBeGreaterThan(0);
	},
);

test('represents a single click as a zero-length round-capped stroke', () => {
	expect(createFreehandGeometry([[10, 20]])).toEqual({
		position: { x: 10, y: 20 },
		width: 1,
		height: 1,
		path: 'M0.00,0.00 L0.00,0.00',
	});
});

test('resizes an open stroke without adding a return edge', () => {
	const path = 'M0.00,5.00 Q10.00,10.00 20.00,5.00 L30.00,0.00';
	expect(scaleFreehandPath(path, 2, 3)).toBe('M0.00,15.00 Q20.00,30.00 40.00,15.00 L60.00,0.00');
});

test('uses saved open centerlines without resampling or changing their geometry', () => {
	const path = 'M0.00,5.00 Q10.00,10.00 20.00,5.00 L30.00,0.00';
	expect(getFreehandStrokePath(path)).toBe(path);
});

test('reconstructs one forward stroke from both sides of a saved outline', () => {
	const outline = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	Object.assign(outline, {
		getTotalLength: () => 204,
		getPointAtLength: (distance: number) => {
			if (distance <= 100) return { x: distance, y: 0 };
			if (distance <= 102) return { x: 100, y: distance - 100 };
			if (distance <= 202) return { x: 202 - distance, y: 2 };
			return { x: 0, y: 204 - distance };
		},
	});
	const createElement = vi.spyOn(document, 'createElementNS').mockReturnValue(outline);

	try {
		const path = getFreehandStrokePath('M0,0 L100,0 L100,2 L0,2 Z');
		const points = Array.from(path.matchAll(/(-?\d+\.\d+),(-?\d+\.\d+)/g), match => ({
			x: Number(match[1]),
			y: Number(match[2]),
		}));

		expect(path.match(/M/g)).toHaveLength(1);
		expect(path).not.toMatch(/Z/i);
		expect(points[0]).toEqual({ x: 0, y: 0 });
		expect(points[points.length - 1]).toEqual({ x: 100, y: 2 });
		for (let index = 1; index < points.length; index += 1) {
			expect(points[index].x).toBeGreaterThanOrEqual(points[index - 1].x);
			expect(points[index].y).toBeGreaterThanOrEqual(0);
			expect(points[index].y).toBeLessThanOrEqual(2);
		}
		expect(
			points.filter(point => point.x > 5 && point.x < 95).every(point => point.y === 1),
		).toBe(true);
	} finally {
		createElement.mockRestore();
	}
});
