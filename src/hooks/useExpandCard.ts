import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { atomFamily } from 'jotai/utils';

export const expandedCardsAtom = atom<Set<string>>(new Set<string>());

const isExpanded = atomFamily((id: string) => {
	return atom(get => get(expandedCardsAtom).has(id));
});

export const useExpandCard = (id: string) => {
	const expanded = useAtomValue(isExpanded(id));
	const setExpanded = useSetAtom(expandedCardsAtom);
	const toggle = () => {
		setExpanded(prev => {
			const newSet = new Set(prev);
			if (newSet.has(id)) {
				newSet.delete(id);
			} else {
				newSet.add(id);
			}
			return newSet;
		});
	};
	return { expanded, toggle };
};

export const useToggleAll = () => {
	const [expandedCards, setExpanded] = useAtom(expandedCardsAtom);
	const toggleAll = (ids: string[]) => {
		if (expandedCards.size === ids.length) return setExpanded(new Set());
		if (expandedCards.size >= 0) return setExpanded(new Set([...expandedCards, ...ids]));
	};
	return { toggleAll, expandedCards };
};
