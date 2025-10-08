import { Issue } from '../validators';

export const getNextIssuePosition = (
	existing: Issue[],
	{ nodeWidth = 250, nodeHeight = 200, gap = 40, columns = 5 }: GetNextIssuePositionOptions = {},
) => {
	const cellW = nodeWidth + gap;
	const cellH = nodeHeight + gap;

	const occupied = new Set<string>();
	for (const issue of existing) {
		const col = Math.round(issue.node.node_style.x_position / cellW);
		const row = Math.round(issue.node.node_style.y_position / cellH);
		occupied.add(`${col},${row}`);
	}

	for (let row = 0; ; row++) {
		for (let col = 0; col < columns; col++) {
			const key = `${col},${row}`;
			if (!occupied.has(key)) {
				return { x: col * cellW, y: row * cellH };
			}
		}
	}
};

type GetNextIssuePositionOptions = {
	nodeWidth?: number;
	nodeHeight?: number;
	gap?: number;
	columns?: number;
};
