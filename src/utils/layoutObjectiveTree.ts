import { ObjectiveLink } from '../hooks/useObjectiveLinks';
import { Objective, ObjectiveType } from '../validators';

// One node per objective, placed under its primary parent; links to other parents are cross-links
export type ObjectiveTreeNode = {
	key: string;
	objective: Objective;
	parentKey: string | null;
	children: ObjectiveTreeNode[];
};

const levels: ObjectiveType[] = ['Strategic', 'Fundamental', 'Mean'];

export const buildObjectiveForest = (
	ordered: Record<ObjectiveType, Objective[]>,
	links: ObjectiveLink[],
) => {
	const position = new Map(
		levels.flatMap(type => ordered[type].map((objective, index) => [objective.id, index])),
	);
	const objectivesById = new Map(
		levels.flatMap(type => ordered[type].map(objective => [objective.id, objective])),
	);
	const positionOf = (objectiveId: string) => position.get(objectiveId) ?? 0;

	// The primary parent is the first linked parent in row order
	const primaryParent = new Map<string, string>();
	links
		.toSorted((a, b) => positionOf(a.parent_id) - positionOf(b.parent_id))
		.forEach(link => {
			if (!primaryParent.has(link.child_id)) primaryParent.set(link.child_id, link.parent_id);
		});
	const childIds = new Map<string, string[]>();
	primaryParent.forEach((parentId, childId) =>
		childIds.set(parentId, [...(childIds.get(parentId) ?? []), childId]),
	);

	const build = (objective: Objective, parentKey: string | null): ObjectiveTreeNode => ({
		key: objective.id,
		objective,
		parentKey,
		children: (childIds.get(objective.id) ?? [])
			.toSorted((a, b) => positionOf(a) - positionOf(b))
			.map(id => build(objectivesById.get(id)!, objective.id)),
	});

	// Every Strategic objective is a root; lower objectives only when nothing links to them
	const roots = levels.flatMap(type =>
		ordered[type].filter(objective => type === 'Strategic' || !primaryParent.has(objective.id)),
	);
	return roots.map(root => build(root, null));
};

// Tidy tree: leaves are lined up along the sibling axis, parents are centred on their children
// and separate trees get extra space. Returns each node's offset along that axis, by node key.
export const layoutObjectiveTree = (
	forest: ObjectiveTreeNode[],
	sizeOf: (objectiveId: string) => number,
	{ nodeGap = 12, treeGap = 32 } = {},
) => {
	const offsets: Record<string, number> = {};
	const levelNext = levels.map(() => 0);
	const levelOf = (node: ObjectiveTreeNode) => levels.indexOf(node.objective.type);
	const centreOf = (node: ObjectiveTreeNode) => offsets[node.key] + sizeOf(node.objective.id) / 2;

	const shift = (node: ObjectiveTreeNode, delta: number, shiftedLevels: Set<number>) => {
		offsets[node.key] += delta;
		shiftedLevels.add(levelOf(node));
		node.children.forEach(child => shift(child, delta, shiftedLevels));
	};

	let treeStart = 0;
	const place = (node: ObjectiveTreeNode) => {
		const level = levelOf(node);
		const size = sizeOf(node.objective.id);
		const minOffset = Math.max(levelNext[level], treeStart);
		if (node.children.length === 0) {
			offsets[node.key] = minOffset;
		} else {
			node.children.forEach(place);
			const centre = (centreOf(node.children[0]) + centreOf(node.children.at(-1)!)) / 2;
			offsets[node.key] = centre - size / 2;
			if (offsets[node.key] < minOffset) {
				// The children were just placed last on their levels, so they can move freely
				const delta = minOffset - offsets[node.key];
				const shiftedLevels = new Set<number>();
				node.children.forEach(child => shift(child, delta, shiftedLevels));
				shiftedLevels.forEach(shiftedLevel => (levelNext[shiftedLevel] += delta));
				offsets[node.key] = minOffset;
			}
		}
		levelNext[level] = offsets[node.key] + size + nodeGap;
	};

	forest.forEach(root => {
		place(root);
		treeStart = Math.max(...levelNext) - nodeGap + treeGap;
	});

	return { offsets, extent: Math.max(0, ...levelNext.map(next => next - nodeGap)) };
};
