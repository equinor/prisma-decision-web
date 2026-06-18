import { useLocalStorage } from '@uidotdev/usehooks';
import { LayoutOptions } from 'elkjs/lib/elk-api';

export const useInfluenceDiagramSettings = () => {
	return useLocalStorage<LayoutOptions>('influenceDiagramLayoutOptions', {
		'elk.spacing.edgeNode': '70',
		'elk.spacing.nodeNode': '100',
		'elk.direction': 'RIGHT',
		'elk.layered.spacing.edgeNodeBetweenLayers': '100',
		'elk.layered.spacing.nodeNodeBetweenLayers': '250',
	});
};
