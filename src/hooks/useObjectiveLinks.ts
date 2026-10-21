import { useLocalStorage } from '@uidotdev/usehooks';
import { useMemo } from 'react';
import { useSelectedProject } from '../components/ProjectPage/ProjectContext';
import { Objective, ObjectiveType } from '../validators';

export type ObjectiveLink = {
	id: string;
	parent_id: string;
	child_id: string;
};

// Strategic <- supported by Fundamental <- supported by Mean
export const childObjectiveType: Partial<Record<ObjectiveType, ObjectiveType>> = {
	Strategic: 'Fundamental',
	Fundamental: 'Mean',
};

export const parentObjectiveType: Partial<Record<ObjectiveType, ObjectiveType>> = {
	Fundamental: 'Strategic',
	Mean: 'Fundamental',
};

export const objectiveTypeLabel: Record<ObjectiveType, string> = {
	Strategic: 'Strategic',
	Fundamental: 'Fundamental',
	Mean: 'Means',
};

const noLinks: ObjectiveLink[] = [];

// Drop links whose objectives were deleted or whose types no longer form a valid level pair
export const filterValidLinks = (links: ObjectiveLink[], objectivesById: Map<string, Objective>) =>
	links.filter(link => {
		const parent = objectivesById.get(link.parent_id);
		const child = objectivesById.get(link.child_id);
		return parent && child && childObjectiveType[parent.type] === child.type;
	});

// PoC: links are kept in localStorage per project until the API supports them.
export const useObjectiveLinks = () => {
	const project = useSelectedProject();
	const [storedLinks, setLinks] = useLocalStorage<ObjectiveLink[]>(
		`objectiveLinks-${project.id}`,
		noLinks,
	);
	// useLocalStorage re-parses on every render; keep the array identity stable for memo/effect deps
	const serialized = JSON.stringify(storedLinks);
	const links = useMemo<ObjectiveLink[]>(() => JSON.parse(serialized), [serialized]);

	const addLink = (parentId: string, childId: string) => {
		if (links.some(link => link.parent_id === parentId && link.child_id === childId)) return;
		setLinks([...links, { id: crypto.randomUUID(), parent_id: parentId, child_id: childId }]);
	};

	const removeLink = (linkId: string) => {
		setLinks(links.filter(link => link.id !== linkId));
	};

	// Replaces all links of one objective, keeping the ids of links that stay
	const setLinksFor = (objectiveId: string, parentIds: string[], childIds: string[]) => {
		const linkBetween = (parentId: string, childId: string) =>
			links.find(link => link.parent_id === parentId && link.child_id === childId) ?? {
				id: crypto.randomUUID(),
				parent_id: parentId,
				child_id: childId,
			};
		setLinks([
			...links.filter(
				link => link.parent_id !== objectiveId && link.child_id !== objectiveId,
			),
			...parentIds.map(parentId => linkBetween(parentId, objectiveId)),
			...childIds.map(childId => linkBetween(objectiveId, childId)),
		]);
	};

	return { links, addLink, removeLink, setLinksFor };
};
