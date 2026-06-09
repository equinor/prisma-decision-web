import { getSegmentLength } from './getSegmentLength';

export type PolylinePoint = [number, number];

export const buildRoundedPolylinePath = (points: PolylinePoint[], radius = 8) => {
	const collapsedPoints = collapseConsecutiveDuplicatePoints(points);
	if (collapsedPoints.length === 0) return '';
	if (collapsedPoints.length === 1) {
		const [x, y] = collapsedPoints[0];
		return `M ${x} ${y}`;
	}
	if (collapsedPoints.length === 2) {
		const [start, end] = collapsedPoints;
		return `M ${start[0]} ${start[1]} L ${end[0]} ${end[1]}`;
	}

	let path = `M ${collapsedPoints[0][0]} ${collapsedPoints[0][1]}`;

	for (let index = 1; index < collapsedPoints.length - 1; index += 1) {
		const previous = collapsedPoints[index - 1];
		const current = collapsedPoints[index];
		const next = collapsedPoints[index + 1];
		const incomingLength = getSegmentLength(previous, current);
		const outgoingLength = getSegmentLength(current, next);

		if (incomingLength === 0 || outgoingLength === 0) {
			path += ` L ${current[0]} ${current[1]}`;
			continue;
		}

		const incomingVector = [
			(current[0] - previous[0]) / incomingLength,
			(current[1] - previous[1]) / incomingLength,
		] as const;
		const outgoingVector = [
			(next[0] - current[0]) / outgoingLength,
			(next[1] - current[1]) / outgoingLength,
		] as const;
		const isStraight =
			Math.abs(incomingVector[0] - outgoingVector[0]) < 0.001 &&
			Math.abs(incomingVector[1] - outgoingVector[1]) < 0.001;

		if (isStraight) {
			path += ` L ${current[0]} ${current[1]}`;
			continue;
		}

		const cornerRadius = Math.min(radius, incomingLength / 2, outgoingLength / 2);
		const beforeCorner: PolylinePoint = [
			current[0] - incomingVector[0] * cornerRadius,
			current[1] - incomingVector[1] * cornerRadius,
		];
		const afterCorner: PolylinePoint = [
			current[0] + outgoingVector[0] * cornerRadius,
			current[1] + outgoingVector[1] * cornerRadius,
		];

		path += ` L ${beforeCorner[0]} ${beforeCorner[1]}`;
		path += ` Q ${current[0]} ${current[1]} ${afterCorner[0]} ${afterCorner[1]}`;
	}

	const lastPoint = collapsedPoints.at(-1) ?? collapsedPoints[0];
	path += ` L ${lastPoint[0]} ${lastPoint[1]}`;

	return path;
};

const duplicatePointEpsilon = 0.1;

const collapseConsecutiveDuplicatePoints = (points: PolylinePoint[]) => {
	return points.reduce<PolylinePoint[]>((result, point) => {
		const previousPoint = result.at(-1);
		if (
			previousPoint &&
			Math.abs(previousPoint[0] - point[0]) < duplicatePointEpsilon &&
			Math.abs(previousPoint[1] - point[1]) < duplicatePointEpsilon
		) {
			return result;
		}

		result.push(point);
		return result;
	}, []);
};
