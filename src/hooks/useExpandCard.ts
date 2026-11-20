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

export const useToggleAll = (ids: string[]) => {
	const [expandedCards, setExpanded] = useAtom(expandedCardsAtom);
	const allExpanded = ids.length > 0 && ids.every(id => expandedCards.has(id));
	const toggleAll = () => {
		setExpanded(prev => {
			const shouldCollapse = ids.every(id => prev.has(id));
			const next = new Set(prev);
			for (const id of ids) {
				if (shouldCollapse) {
					next.delete(id);
				} else {
					next.add(id);
				}
			}
			return next;
		});
	};
	return { toggleAll, allExpanded };
};
