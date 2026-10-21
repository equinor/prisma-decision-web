import { ObjectiveLink } from '../hooks/useObjectiveLinks';
import { Objective } from '../validators';

// anchorOffset: centre of the title row from the card top (where arcs attach)
export type CardSize = { height: number; anchorOffset: number; anchorHeight: number };

export const defaultCardSize: CardSize = { height: 40, anchorOffset: 20, anchorHeight: 36 };

const cardGap = 16;
const groupGap = 40;
const iterations = 12;

// Weighted isotonic regression (pool adjacent violators): the closest non-decreasing fit.
const isotonic = (targets: number[], weights: number[]) => {
	const blocks: { value: number; weight: number; count: number }[] = [];
	targets.forEach((value, index) => {
		blocks.push({ value, weight: weights[index], count: 1 });
		while (
			blocks.length > 1 &&
			blocks[blocks.length - 2].value > blocks[blocks.length - 1].value
		) {
			const last = blocks.pop()!;
			const previous = blocks[blocks.length - 1];
			previous.value =
				(previous.value * previous.weight + last.value * last.weight) /
				(previous.weight + last.weight);
			previous.weight += last.weight;
			previous.count += last.count;
		}
	});
	return blocks.flatMap(block => Array<number>(block.count).fill(block.value));
};

// Vertical positions for an already ordered hierarchy: every card is pulled towards the centre of
// the cards it links to, without overlapping (min gaps) or changing the order. Unrelated groups get
// extra space between them.
export const layoutObjectiveHierarchy = (
	levels: Objective[][],
	links: ObjectiveLink[],
	sizes: Record<string, CardSize>,
) => {
	const sizeOf = (id: string) => sizes[id] ?? defaultCardSize;

	const neighbours = new Map<string, string[]>();
	const groupRoot = new Map<string, string>();
	const findGroup = (id: string): string => {
		const root = groupRoot.get(id) ?? id;
		if (root === id) return id;
		const found = findGroup(root);
		groupRoot.set(id, found);
		return found;
	};
	links.forEach(link => {
		neighbours.set(link.parent_id, [...(neighbours.get(link.parent_id) ?? []), link.child_id]);
		neighbours.set(link.child_id, [...(neighbours.get(link.child_id) ?? []), link.parent_id]);
		groupRoot.set(findGroup(link.child_id), findGroup(link.parent_id));
	});
	// Unlinked objectives are kept together as one group
	const groupOf = (id: string) => (neighbours.has(id) ? findGroup(id) : 'unlinked');

	const columns = levels.map(level => {
		const ids = level.map(objective => objective.id);
		const gaps = ids
			.slice(0, -1)
			.map((id, index) => (groupOf(id) === groupOf(ids[index + 1]) ? cardGap : groupGap));
		const offsets: number[] = [];
		let offset = 0;
		ids.forEach((id, index) => {
			offsets.push(offset);
			offset += sizeOf(id).height + (gaps[index] ?? 0);
		});
		const weights = ids.map(id => 1 + (neighbours.get(id)?.length ?? 0));
		return { ids, offsets, weights };
	});

	const top = new Map<string, number>();
	columns.forEach(({ ids, offsets }) => ids.forEach((id, index) => top.set(id, offsets[index])));
	const anchorY = (id: string) => top.get(id)! + sizeOf(id).anchorOffset;

	const relax = ({ ids, offsets, weights }: (typeof columns)[number]) => {
		if (ids.length === 0) return;
		const desired = ids.map(id => {
			const linked = neighbours.get(id);
			if (!linked?.length) return top.get(id)!;
			const centre =
				linked.reduce((sum, linkedId) => sum + anchorY(linkedId), 0) / linked.length;
			return centre - sizeOf(id).anchorOffset;
		});
		// Shifting by the stacked offsets turns "keep min gaps" into "stay non-decreasing"
		isotonic(
			desired.map((value, index) => value - offsets[index]),
			weights,
		).forEach((value, index) => top.set(ids[index], value + offsets[index]));
	};

	for (let iteration = 0; iteration < iterations; iteration++) {
		const order = iteration % 2 === 0 ? columns : columns.toReversed();
		order.forEach(relax);
	}

	const ids = [...top.keys()];
	const minTop = ids.length ? Math.min(...ids.map(id => top.get(id)!)) : 0;
	const tops = Object.fromEntries(ids.map(id => [id, top.get(id)! - minTop]));
	const height = Math.max(0, ...ids.map(id => tops[id] + sizeOf(id).height));
	return { tops, height };
};
