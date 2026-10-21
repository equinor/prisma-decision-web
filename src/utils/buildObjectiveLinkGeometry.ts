import { ObjectiveLink } from '../hooks/useObjectiveLinks';

// anchorY/anchorHeight: the title row, so expanded cards keep their ports at the top
export type CardRect = {
	x: number;
	y: number;
	width: number;
	height: number;
	anchorY: number;
	anchorHeight: number;
};

export type LinkGeometry = {
	link: ObjectiveLink;
	path: string;
	// Midpoint of the curve, used to place the remove button
	handle: [number, number];
};

const portSpacing = 10;

// direction 1 leaves rightwards and arrives from the left; -1 is the mirror image
export const buildBezierPath = (
	[x1, y1]: [number, number],
	[x2, y2]: [number, number],
	direction: 1 | -1 = 1,
) => {
	const bend = Math.max(Math.abs(x2 - x1) / 2, 24) * direction;
	return `M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`;
};

// Smooth curves from the parent's right edge to the child's left edge (like React Flow's
// default bezier edge). Arrows into the same child get their own port, ordered by parent position.
export const buildObjectiveLinkGeometry = (
	links: ObjectiveLink[],
	rects: Record<string, CardRect>,
): LinkGeometry[] => {
	const measured = links.filter(link => rects[link.parent_id] && rects[link.child_id]);

	const targetY = new Map<string, number>();
	Map.groupBy(measured, link => link.child_id).forEach((childLinks, childId) => {
		const child = rects[childId];
		const spacing =
			childLinks.length > 1
				? Math.min(portSpacing, (child.anchorHeight - 8) / (childLinks.length - 1))
				: 0;
		childLinks
			.toSorted(
				(a, b) =>
					rects[a.parent_id].anchorY - rects[b.parent_id].anchorY ||
					a.parent_id.localeCompare(b.parent_id),
			)
			.forEach((link, index) =>
				targetY.set(
					link.id,
					child.anchorY + (index - (childLinks.length - 1) / 2) * spacing,
				),
			);
	});

	return measured.map(link => {
		const parent = rects[link.parent_id];
		const start: [number, number] = [parent.x + parent.width, parent.anchorY];
		const end: [number, number] = [rects[link.child_id].x, targetY.get(link.id)!];
		return {
			link,
			path: buildBezierPath(start, end),
			handle: [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2],
		};
	});
};
