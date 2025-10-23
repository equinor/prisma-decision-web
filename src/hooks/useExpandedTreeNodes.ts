import { atom, useAtomValue, useSetAtom } from 'jotai';
import { atomFamily } from 'jotai/utils';

export const expandedDecisionTreeNodes = atom(new Set<string>());

export const useExpandedTreeNodes = (id: string) => {
	const expanded = useAtomValue(isExpanded(id));
	const setExpanded = useSetAtom(expandedDecisionTreeNodes);
	const toggleExpanded = () => {
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
	return { expanded, toggleExpanded };
};

const isExpanded = atomFamily((id: string) => {
	return atom(get => get(expandedDecisionTreeNodes).has(id));
});
