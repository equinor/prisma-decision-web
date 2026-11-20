import { Edge, EdgeProps, useInternalNode } from '@xyflow/react';
import { useMemo } from 'react';
import { InfluenceEdgeData } from '../../../../utils/convertToInfluenceEdges';
import { InfluenceEdge } from '../InfluenceEdge';
import { getShapeEdgeRoute } from './getShapeEdgeRoute';

export const ShapeEdge = ({
	source: sourceId,
	target: targetId,
	data,
	...props
}: EdgeProps<Edge<InfluenceEdgeData>>) => {
	const source = useInternalNode(sourceId);
	const target = useInternalNode(targetId);
	const route = useMemo(
		() => getShapeEdgeRoute(data?.route, source, target),
		[data?.route, source, target],
	);

	return (
		<InfluenceEdge {...props} source={sourceId} target={targetId} data={{ ...data, route }} />
	);
};
