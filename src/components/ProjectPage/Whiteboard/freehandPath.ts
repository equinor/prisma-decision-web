import { getStrokePoints, type StrokeOptions } from 'perfect-freehand';

export type FreehandInputPoint = [x: number, y: number];

const average = (first: number, second: number) => (first + second) / 2;
export const FREEHAND_BASE_STROKE_WIDTH = 2;
export const FREEHAND_STROKE_OPTIONS: StrokeOptions = {
	size: FREEHAND_BASE_STROKE_WIDTH,
	streamline: 0.45,
	last: true,
};

const formatPoint = ([x, y]: FreehandInputPoint) => `${x.toFixed(2)},${y.toFixed(2)}`;

const getSvgPathFromStroke = (points: FreehandInputPoint[]) => {
	if (points.length === 0) return '';

	let result = `M${formatPoint(points[0])}`;
	for (let index = 1; index < points.length - 1; index += 1) {
		const point = points[index];
		const nextPoint = points[index + 1];
		result += ` Q${formatPoint(point)} ${formatPoint([
			average(point[0], nextPoint[0]),
			average(point[1], nextPoint[1]),
		])}`;
	}

	return `${result} L${formatPoint(points[points.length - 1])}`;
};

const getStrokeBounds = (points: FreehandInputPoint[]) => {
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
	const strokePoints =
		points.length === 1
			? points
			: getStrokePoints(points, {
					...FREEHAND_STROKE_OPTIONS,
					...strokeOptions,
				}).map(({ point }) => point);
	const bounds = getStrokeBounds(strokePoints);
	const normalizedPoints = strokePoints.map<FreehandInputPoint>(([x, y]) => [
		x - bounds.minX,
		y - bounds.minY,
	]);

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

export const isLegacyFreehandPath = (path: string) => /z\s*$/i.test(path);

export const getFreehandStrokePath = (path: string) => {
	if (!isLegacyFreehandPath(path)) return path;

	const outline = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	outline.setAttribute('d', path);
	const length = outline.getTotalLength();
	const sampleCount = Math.max(1, Math.min(2048, Math.ceil(length / 4)));
	const points: FreehandInputPoint[] = [];

	// Legacy drawings only retain an outline. Approximate its centerline by
	// averaging samples traversing the two sides in opposite directions.
	for (let index = 0; index <= sampleCount; index += 1) {
		const distance = (length * index) / (2 * sampleCount);
		const first = outline.getPointAtLength(distance);
		const second = outline.getPointAtLength(length - distance);
		points.push([average(first.x, second.x), average(first.y, second.y)]);
	}

	return getSvgPathFromStroke(points);
};

export const scaleFreehandPath = (path: string, scaleX: number, scaleY: number) => {
	return path.replace(
		/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g,
		(_, x: string, y: string) =>
			`${(Number(x) * scaleX).toFixed(2)},${(Number(y) * scaleY).toFixed(2)}`,
	);
};
