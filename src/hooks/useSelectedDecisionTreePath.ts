/* eslint-disable @typescript-eslint/no-unused-vars */
import { atom, useAtom } from 'jotai';
import { atomFamily } from 'jotai-family';
import { DecisionPath } from './api/useGetDecisionTree';
import { useSelectedProject } from '../components/ProjectPage/ProjectContext';

export const useSelectedDecisionTreePath = (treeType: 'decision' | 'solution') => {
	const project = useSelectedProject();
	const [selectedPath, setSelectedPath] = useAtom(
		selectedDecisionTreePath({ projectId: project.id, treeType }),
	);

	return {
		selectedPath,
		selectPath: setSelectedPath,
		clearPath: () => setSelectedPath(null),
	};
};

const selectedDecisionTreePath = atomFamily(
	// @ts-expect-error - atomFamily is not correctly typed
	({ projectId, treeType }: { projectId: string; treeType: 'decision' | 'solution' }) =>
		atom<DecisionPath | null>(null),
	(a, b) => `${a.projectId}-${a.treeType}` === `${b.projectId}-${b.treeType}`,
);
