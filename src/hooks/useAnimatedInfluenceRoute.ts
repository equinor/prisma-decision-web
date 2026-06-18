import { useEffect, useRef, useState } from 'react';
import { buildRoundedPolylinePath } from '../utils/buildRoundedPolylinePath';
import { InfluenceEdgePoint, InfluenceEdgeRoute } from '../utils/convertToInfluenceEdges';

const edgeAnimationDurationMs = 220;
const emptyRoute: InfluenceEdgeRoute = {
	path: '',
	points: [],
	labelX: 0,
	labelY: 0,
};

export const useAnimatedInfluenceRoute = (route?: InfluenceEdgeRoute) => {
	const resolvedRoute = route ?? emptyRoute;
	const [displayPath, setDisplayPath] = useState(resolvedRoute.path);
	const previousPointsRef = useRef(resolvedRoute.points);

	useEffect(() => {
		const nextPoints = resolvedRoute.points;
		const fromPoints =
			previousPointsRef.current.length >= 2 ? previousPointsRef.current : nextPoints;

		if (
			nextPoints.length < 2 ||
			fromPoints.length < 2 ||
			arePointsEqual(fromPoints, nextPoints)
		) {
			previousPointsRef.current = nextPoints;
			setDisplayPath(resolvedRoute.path);
			return;
		}

		const targetPointCount = Math.max(fromPoints.length, nextPoints.length);
		const expandedFromPoints = expandPointCount(fromPoints, targetPointCount);
		const expandedNextPoints = expandPointCount(nextPoints, targetPointCount);
		let animationFrameId = 0;
		let cancelled = false;
		const animationStart = performance.now();

		const updateAnimation = (currentTime: number) => {
			if (cancelled) return;

			const elapsed = currentTime - animationStart;
			const progress = Math.min(elapsed / edgeAnimationDurationMs, 1);
			const points = interpolatePointArrays(
				expandedFromPoints,
				expandedNextPoints,
				easeEdgeAnimation(progress),
			);

			previousPointsRef.current = points;
			setDisplayPath(buildRoundedPolylinePath(points));

			if (progress < 1) {
				animationFrameId = requestAnimationFrame(updateAnimation);
				return;
			}

			previousPointsRef.current = nextPoints;
			setDisplayPath(resolvedRoute.path);
		};

		animationFrameId = requestAnimationFrame(updateAnimation);

		return () => {
			cancelled = true;
			cancelAnimationFrame(animationFrameId);
		};
	}, [resolvedRoute]);

	return displayPath;
};

const arePointsEqual = (a: InfluenceEdgePoint[], b: InfluenceEdgePoint[]) => {
	if (a.length !== b.length) return false;

	return a.every(([ax, ay], index) => {
		const [bx, by] = b[index];
		return Math.abs(ax - bx) < 0.1 && Math.abs(ay - by) < 0.1;
	});
};

const expandPointCount = (points: InfluenceEdgePoint[], targetCount: number) => {
	if (points.length === 0) return [];
	if (points.length === targetCount) return points;
	if (points.length === 1 || targetCount <= 1) {
		return Array.from({ length: targetCount }, () => points[0]);
	}

	return Array.from({ length: targetCount }, (_, index) => {
		const sourceIndex = Math.round((index * (points.length - 1)) / (targetCount - 1));
		return points[sourceIndex];
	});
};

const interpolatePointArrays = (
	fromPoints: InfluenceEdgePoint[],
	toPoints: InfluenceEdgePoint[],
	progress: number,
): InfluenceEdgePoint[] => {
	return fromPoints.map(([fromX, fromY], index) => {
		const [toX, toY] = toPoints[index] ?? toPoints.at(-1) ?? [fromX, fromY];
		return [fromX + (toX - fromX) * progress, fromY + (toY - fromY) * progress];
	});
};

const easeEdgeAnimation = (progress: number) => {
	return 1 - (1 - progress) ** 3;
};
