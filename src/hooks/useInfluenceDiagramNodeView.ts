import { useLocalStorage } from '@uidotdev/usehooks';

export type InfluenceDiagramNodeView = 'card' | 'shape';

export const useInfluenceDiagramNodeView = () => {
	return useLocalStorage<InfluenceDiagramNodeView>('influenceDiagramNodeView', 'card');
};
