import { InfluenceEdgePoint } from './convertToInfluenceEdges';
import { getSegmentLength } from './getSegmentLength';

export const getEdgeLabelPosition = (points: InfluenceEdgePoint[]) => {
	if (points.length < 2) {
		return {
			labelX: points[0]?.[0] ?? 0,
			labelY: points[0]?.[1] ?? 0,
		};
	}

	const segments = points.slice(1).map((point, index) => {
		const previousPoint = points[index];
		const length = getSegmentLength(point, previousPoint);

		return {
			start: previousPoint,
			end: point,
			length,
		};
	});

	const totalLength = segments.reduce((sum, segment) => sum + segment.length, 0);
	const halfwayLength = totalLength / 2;
	let travelled = 0;

	for (const segment of segments) {
		if (travelled + segment.length >= halfwayLength) {
			const distanceIntoSegment = halfwayLength - travelled;
			const ratio = segment.length === 0 ? 0 : distanceIntoSegment / segment.length;

			return {
				labelX: segment.start[0] + (segment.end[0] - segment.start[0]) * ratio,
				labelY: segment.start[1] + (segment.end[1] - segment.start[1]) * ratio,
			};
		}

		travelled += segment.length;
	}

	const lastPoint = points.at(-1) ?? points[0];
	return {
		labelX: lastPoint[0],
		labelY: lastPoint[1],
	};
};
