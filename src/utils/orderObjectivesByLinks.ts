import { ObjectiveLink } from '../hooks/useObjectiveLinks';
import { Objective, ObjectiveType } from '../validators';

const levels: ObjectiveType[] = ['Strategic', 'Fundamental', 'Mean'];
const sweeps = 4;

type Levels = Objective[][];

const countCrossings = (ordered: Levels, links: ObjectiveLink[]) => {
	let crossings = 0;
	for (let level = 0; level < ordered.length - 1; level++) {
		const upper = new Map(ordered[level].map((objective, index) => [objective.id, index]));
		const lower = new Map(ordered[level + 1].map((objective, index) => [objective.id, index]));
		const edges = links.flatMap(link => {
			const from = upper.get(link.parent_id);
			const to = lower.get(link.child_id);
			return from === undefined || to === undefined ? [] : [[from, to]];
		});
		for (let a = 0; a < edges.length; a++) {
			for (let b = a + 1; b < edges.length; b++) {
				if ((edges[a][0] - edges[b][0]) * (edges[a][1] - edges[b][1]) < 0) crossings++;
			}
		}
	}
	return crossings;
};

// Stable sort by the mean position of linked objectives in the reference level.
// Unlinked objectives keep their current (scaled) position.
const sortByNeighbours = (
	level: Objective[],
	reference: Objective[],
	neighbours: Map<string, string[]>,
) => {
	const referenceIndex = new Map(reference.map((objective, index) => [objective.id, index]));
	const scale = reference.length / Math.max(level.length, 1);
	return level
		.map((objective, index) => {
			const positions = (neighbours.get(objective.id) ?? []).flatMap(id => {
				const position = referenceIndex.get(id);
				return position === undefined ? [] : [position];
			});
			const barycenter = positions.length
				? positions.reduce((sum, position) => sum + position, 0) / positions.length
				: index * scale;
			return { objective, barycenter, index };
		})
		.toSorted((a, b) => a.barycenter - b.barycenter || a.index - b.index)
		.map(item => item.objective);
};

// Barycenter heuristic for layered graphs: every level is reordered so that link arcs cross
// as little as possible. The manual order is only the starting point and tie-breaker.
export const orderObjectivesByLinks = (
	objectives: Objective[],
	links: ObjectiveLink[],
): Record<ObjectiveType, Objective[]> => {
	const parents = new Map<string, string[]>();
	const children = new Map<string, string[]>();
	links.forEach(link => {
		parents.set(link.child_id, [...(parents.get(link.child_id) ?? []), link.parent_id]);
		children.set(link.parent_id, [...(children.get(link.parent_id) ?? []), link.child_id]);
	});

	let ordered: Levels = levels.map(type =>
		objectives.filter(objective => objective.type === type),
	);
	let best = ordered;
	let bestCrossings = countCrossings(ordered, links);
	const keepIfBetter = () => {
		const crossings = countCrossings(ordered, links);
		// `<=` so ties prefer the link-aligned order over the manual one
		if (crossings <= bestCrossings) {
			best = ordered;
			bestCrossings = crossings;
		}
	};

	for (let sweep = 0; sweep < sweeps; sweep++) {
		for (let level = 1; level < ordered.length; level++) {
			ordered = ordered.with(
				level,
				sortByNeighbours(ordered[level], ordered[level - 1], parents),
			);
		}
		keepIfBetter();
		for (let level = ordered.length - 2; level >= 0; level--) {
			ordered = ordered.with(
				level,
				sortByNeighbours(ordered[level], ordered[level + 1], children),
			);
		}
		keepIfBetter();
	}

	// Unlinked objectives go first (in manual order) instead of being wedged between linked groups
	const linked = new Set(links.flatMap(link => [link.parent_id, link.child_id]));
	const [strategic, fundamental, means] = best.map(level => [
		...level.filter(objective => !linked.has(objective.id)),
		...level.filter(objective => linked.has(objective.id)),
	]);
	return { Strategic: strategic, Fundamental: fundamental, Mean: means };
};
