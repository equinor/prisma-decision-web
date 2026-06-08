import { useLocalStorage } from '@uidotdev/usehooks';

export const useInfluenceDiagramSettings = () => {
	return useLocalStorage('influenceDiagramLayoutOptions', {
		'elk.algorithm.graphviz': 'dot',
		'elk.spacing.edgeNode': '70',
		'elk.spacing.nodeNode': '100',
		'elk.direction': 'RIGHT',
		'elk.layered.spacing.edgeNodeBetweenLayers': '100',
		'elk.layered.spacing.nodeNodeBetweenLayers': '250',
	});
};
