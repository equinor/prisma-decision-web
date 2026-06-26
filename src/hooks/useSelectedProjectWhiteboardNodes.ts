import { useMemo } from 'react';
import { useGetWhiteboardNodes } from './api/useGetWhiteboardNodes';
import { useSelectedProject } from '../components/ProjectPage/ProjectContext';

export const useSelectedProjectWhiteboardNodes = () => {
	const selectedProject = useSelectedProject();
	const { nodes } = useGetWhiteboardNodes();
	const projectNodes = useMemo(() => {
		return nodes
			.filter(node => node.project_id === selectedProject.id)
			.map(node => ({
				zIndex: node.type === 'Rectangle' ? 0 : 1,
				position: {
					x: node.x_position,
					y: node.y_position,
				},
				type: node.type,
				id: node.id,
				style:
					node.type === 'Rectangle' || node.type === 'Arrow' || node.type === 'Freehand'
						? {
								width: node.width,
								height: node.height,
								pointerEvents: 'none' as const,
							}
						: undefined,
				data: {
					...node,
				},
			}));
	}, [nodes, selectedProject.id]);
	return projectNodes;
};
