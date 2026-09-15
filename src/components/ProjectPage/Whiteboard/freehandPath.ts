import { getStroke, type StrokeOptions } from 'perfect-freehand';

export type FreehandInputPoint = [x: number, y: number];

type OutlinePoint = [x: number, y: number];

const average = (first: number, second: number) => (first + second) / 2;
export const FREEHAND_BASE_STROKE_WIDTH = 2;
export const FREEHAND_STROKE_OPTIONS: StrokeOptions = {
	size: FREEHAND_BASE_STROKE_WIDTH,
	thinning: 0.55,
	smoothing: 0.65,
	streamline: 0.45,
	simulatePressure: true,
	last: true,
};

const getSvgPathFromStroke = (points: OutlinePoint[]) => {
	if (points.length < 4) return '';

	let result = '';
	let first = points[0];
	let second = points[1];
	const third = points[2];

	result = `M${first[0].toFixed(2)},${first[1].toFixed(2)} Q${second[0].toFixed(2)},${second[1].toFixed(2)} ${average(second[0], third[0]).toFixed(2)},${average(second[1], third[1]).toFixed(2)} T`;

	for (let index = 2; index < points.length - 1; index += 1) {
		first = points[index];
		second = points[index + 1];
		result += `${average(first[0], second[0]).toFixed(2)},${average(first[1], second[1]).toFixed(2)} `;
	}

	return `${result}Z`;
};

const getOutlineBounds = (points: OutlinePoint[]) => {
	const [firstPoint] = points;
	if (!firstPoint) {
		return {
			minX: 0,
			maxX: 0,
			minY: 0,
			maxY: 0,
		};
	}

	return points.reduce(
		(bounds, [x, y]) => ({
			minX: Math.min(bounds.minX, x),
			maxX: Math.max(bounds.maxX, x),
			minY: Math.min(bounds.minY, y),
			maxY: Math.max(bounds.maxY, y),
		}),
		{
			minX: firstPoint[0],
			maxX: firstPoint[0],
			minY: firstPoint[1],
			maxY: firstPoint[1],
		},
	);
};

export const createFreehandGeometry = (
	points: FreehandInputPoint[],
	strokeOptions?: Partial<StrokeOptions>,
) => {
	const strokePoints = getStroke(points, {
		...FREEHAND_STROKE_OPTIONS,
		...strokeOptions,
	}) as OutlinePoint[];
	const bounds = getOutlineBounds(strokePoints);
	const normalizedPoints = strokePoints.map(
		([x, y]) => [x - bounds.minX, y - bounds.minY] as OutlinePoint,
	);

	return {
		position: {
			x: bounds.minX,
			y: bounds.minY,
		},
		width: Math.max(bounds.maxX - bounds.minX, 1),
		height: Math.max(bounds.maxY - bounds.minY, 1),
		path: getSvgPathFromStroke(normalizedPoints),
	};
};

export const scaleFreehandPath = (path: string, scaleX: number, scaleY: number) => {
	return path.replace(
		/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g,
		(_, x: string, y: string) =>
			`${(Number(x) * scaleX).toFixed(2)},${(Number(y) * scaleY).toFixed(2)}`,
	);
};
