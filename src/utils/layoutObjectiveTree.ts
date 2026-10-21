import { ObjectiveLink } from '../hooks/useObjectiveLinks';
import { Objective, ObjectiveType } from '../validators';

// One node per occurrence: an objective under several parents appears once under each of them
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
	const childIds = new Map<string, string[]>();
	links.forEach(link =>
		childIds.set(link.parent_id, [...(childIds.get(link.parent_id) ?? []), link.child_id]),
	);
	const hasParent = new Set(links.map(link => link.child_id));

	const build = (objective: Objective, parentKey: string | null): ObjectiveTreeNode => {
		const key = parentKey ? `${parentKey}/${objective.id}` : objective.id;
		return {
			key,
			objective,
			parentKey,
			children: (childIds.get(objective.id) ?? [])
				.toSorted((a, b) => (position.get(a) ?? 0) - (position.get(b) ?? 0))
				.map(id => build(objectivesById.get(id)!, key)),
		};
	};

	// Every Strategic objective is a root; lower objectives only when nothing links to them
	const roots = levels.flatMap(type =>
		ordered[type].filter(objective => type === 'Strategic' || !hasParent.has(objective.id)),
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
