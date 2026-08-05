import { type XYPosition } from '@xyflow/react';

const ARROW_HEAD_ANGLE = Math.PI / 7;
const MIN_ARROW_AXIS_SIZE = 24;

export const ARROW_STROKE_WIDTH = 10;
export const ARROW_VIEWBOX_SIZE = 100;
export const ARROW_HEAD_LENGTH = 14;

type Point = XYPosition;

function toNormalizedPoint(point: Point, width: number, height: number): Point {
	const normalizedX =
		width === 0 ? ARROW_VIEWBOX_SIZE / 2 : (point.x / width) * ARROW_VIEWBOX_SIZE;
	const normalizedY =
		height === 0 ? ARROW_VIEWBOX_SIZE / 2 : (point.y / height) * ARROW_VIEWBOX_SIZE;

	return {
		x: normalizedX,
		y: normalizedY,
	};
}

export function fromNormalizedPoint(point: Point, width: number, height: number): Point {
	return {
		x: (point.x / ARROW_VIEWBOX_SIZE) * width,
		y: (point.y / ARROW_VIEWBOX_SIZE) * height,
	};
}

function buildArrowHeadPoint(end: Point, angle: number, headLength: number): Point {
	return {
		x: end.x - Math.cos(angle) * headLength,
		y: end.y - Math.sin(angle) * headLength,
	};
}

function formatCoordinate(value: number) {
	return value.toFixed(2);
}

export function buildArrowPath(start: Point, end: Point, headStart: Point, headEnd: Point) {
	return [
		`M ${formatCoordinate(start.x)} ${formatCoordinate(start.y)}`,
		`L ${formatCoordinate(end.x)} ${formatCoordinate(end.y)}`,
		`M ${formatCoordinate(headStart.x)} ${formatCoordinate(headStart.y)}`,
		`L ${formatCoordinate(end.x)} ${formatCoordinate(end.y)}`,
		`L ${formatCoordinate(headEnd.x)} ${formatCoordinate(headEnd.y)}`,
	].join(' ');
}

export function parseArrowEndpoints(path: string) {
	const values = path.match(/[-+]?\d*\.?\d+/g);
	if (!values || values.length < 4) return null;

	return {
		start: {
			x: Number(values[0]),
			y: Number(values[1]),
		},
		end: {
			x: Number(values[2]),
			y: Number(values[3]),
		},
	};
}

export function createArrowGeometry(
	start: Point,
	end: Point,
	options?: {
		headLength?: number;
	},
) {
	const headLength = options?.headLength ?? ARROW_HEAD_LENGTH;
	const deltaX = end.x - start.x;
	const deltaY = end.y - start.y;
	const extraX = Math.max((MIN_ARROW_AXIS_SIZE - Math.abs(deltaX)) / 2, 0);
	const extraY = Math.max((MIN_ARROW_AXIS_SIZE - Math.abs(deltaY)) / 2, 0);
	const position = {
		x: Math.min(start.x, end.x) - extraX,
		y: Math.min(start.y, end.y) - extraY,
	};
	const width = Math.max(Math.abs(deltaX), MIN_ARROW_AXIS_SIZE);
	const height = Math.max(Math.abs(deltaY), MIN_ARROW_AXIS_SIZE);
	const localStart = {
		x: start.x - position.x,
		y: start.y - position.y,
	};
	const localEnd = {
		x: end.x - position.x,
		y: end.y - position.y,
	};
	const angle = Math.atan2(localEnd.y - localStart.y, localEnd.x - localStart.x);
	const localHeadStart = buildArrowHeadPoint(localEnd, angle - ARROW_HEAD_ANGLE, headLength);
	const localHeadEnd = buildArrowHeadPoint(localEnd, angle + ARROW_HEAD_ANGLE, headLength);
	const normalizedStart = toNormalizedPoint(localStart, width, height);
	const normalizedEnd = toNormalizedPoint(localEnd, width, height);
	const normalizedHeadStart = toNormalizedPoint(localHeadStart, width, height);
	const normalizedHeadEnd = toNormalizedPoint(localHeadEnd, width, height);

	return {
		position,
		width,
		height,
		path: buildArrowPath(
			normalizedStart,
			normalizedEnd,
			normalizedHeadStart,
			normalizedHeadEnd,
		),
	};
}
