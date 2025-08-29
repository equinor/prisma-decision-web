import { atom, useAtomValue, useSetAtom } from 'jotai';
import { atomFamily } from 'jotai/utils';

const expandedCardsAtom = atom<Set<string>>(new Set<string>());

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
