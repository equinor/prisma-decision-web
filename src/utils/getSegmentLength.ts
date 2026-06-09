import { InfluenceEdgePoint } from './convertToInfluenceEdges';

export const getSegmentLength = (from: InfluenceEdgePoint, to: InfluenceEdgePoint) => {
	return Math.hypot(to[0] - from[0], to[1] - from[1]);
};
