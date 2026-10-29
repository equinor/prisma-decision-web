import { useLocalStorage } from '@uidotdev/usehooks';

export type InfluenceDiagramView = 'card' | 'shape';

export const useInfluenceDiagramView = () => {
	const [storedView, setView] = useLocalStorage<InfluenceDiagramView>(
		'influenceDiagramView',
		'card',
	);
	const view = storedView === 'shape' ? 'shape' : 'card';
	return [view, setView] as const;
};
