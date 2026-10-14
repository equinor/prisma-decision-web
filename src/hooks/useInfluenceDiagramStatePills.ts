import { useLocalStorage } from '@uidotdev/usehooks';

export const useInfluenceDiagramStatePills = () => {
	return useLocalStorage('influenceDiagramShowStatePills', true);
};
