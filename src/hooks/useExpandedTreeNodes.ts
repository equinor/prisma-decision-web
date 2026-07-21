/* eslint-disable @typescript-eslint/no-unused-vars */
import { atom, useAtom } from 'jotai';
import { DecisionPath } from './api/useGetDecisionTree';

import { atomFamily } from 'jotai-family';
import { useSelectedProject } from '../components/ProjectPage/ProjectContext';

export const useExpandedTreeNodes = (path: DecisionPath, treeType: 'decision' | 'solution') => {
	const project = useSelectedProject();
	const [expanded, setExpanded] = useAtom(
		expandedDecisionTreeNodes({ projectId: project.id, treeType }),
	);
	const expandPath = (pathSegment: string) => {
		setExpanded(prev => {
			const newPath = [...path, pathSegment];
			return [...prev, newPath];
		});
	};

	const closePath = () => {
		setExpanded(prev => {
			return prev.filter(existingPath => !startsWithDecisionPath(existingPath, path));
		});
	};
	return {
		expanded: hasPath(expanded, path),
		expandedPaths: expanded,
		expandPath,
		closePath,
	};
};
export const expandedDecisionTreeNodes = atomFamily(
	// @ts-expect-error - atomFamily is not correctly typed
	({ projectId, treeType }: { projectId: string; treeType: 'decision' | 'solution' }) =>
		atom<DecisionPath[]>([]),
	(a, b) => `${a.projectId}-${a.treeType}` === `${b.projectId}-${b.treeType}`,
);

export const isSameDecisionPath = (a: DecisionPath, b: DecisionPath) =>
	a.length === b.length && a.every((segment, index) => segment === b[index]);

export const startsWithDecisionPath = (candidate: DecisionPath, prefix: DecisionPath) =>
	prefix.length <= candidate.length &&
	prefix.every((segment, index) => segment === candidate[index]);

export const isDecisionPathSelected = (
	selectedPath: DecisionPath | null,
	currentPath: DecisionPath,
) => selectedPath !== null && startsWithDecisionPath(selectedPath, currentPath);

const hasPath = (paths: DecisionPath[], path: DecisionPath) =>
	paths.some(existingPath => isSameDecisionPath(existingPath, path));
