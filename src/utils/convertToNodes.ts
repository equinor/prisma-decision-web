import { Node } from '@xyflow/react';
import { Issue } from '../components/ProjectPage/ProjectPage';

export const convertToNodes = (issues: Record<string, Issue[]>) => {
	return Object.entries(issues).reduce((acc, [, value]) => {
		return acc.concat(
			value.map(issue => ({
				id: issue.id,
				type: 'issue',
				position: issue.position || { x: 0, y: 0 },
				data: {
					label: issue.name,
					issue,
				},
			})),
		);
	}, [] as Node[]);
};
