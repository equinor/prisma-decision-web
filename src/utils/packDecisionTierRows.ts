type PackDecisionTierRowsOptions = {
	itemWidths: number[];
	moreButtonWidth: number;
	height: number;
	/** Usable row width for a row whose top edge sits at `y` (tier-local). */
	widthAt: (y: number) => number;
	itemHeight: number;
	rowGap: number;
	columnGap: number;
	paddingY: number;
};

export type PackedDecisionTier = {
	/** Tier-local y of the first row. */
	top: number;
	/** Item indices per row, in render order. Rows may be empty in the overflow layout. */
	rows: number[][];
	hiddenCount: number;
};

const rowWidth = (row: number[], itemWidths: number[], columnGap: number) =>
	row.reduce((sum, index, i) => sum + itemWidths[index] + (i > 0 ? columnGap : 0), 0);

export const packDecisionTierRows = ({
	itemWidths,
	moreButtonWidth,
	height,
	widthAt,
	itemHeight,
	rowGap,
	columnGap,
	paddingY,
}: PackDecisionTierRowsOptions): PackedDecisionTier => {
	if (itemWidths.length === 0) return { top: 0, rows: [], hiddenCount: 0 };

	const rowStep = itemHeight + rowGap;
	const blockHeight = (rowCount: number) => rowCount * rowStep - rowGap;
	const rowY = (top: number, row: number) => top + row * rowStep;

	const fill = (rowCount: number, top: number) => {
		const rows: number[][] = [];
		let next = 0;
		for (let r = 0; r < rowCount; r++) {
			const available = widthAt(rowY(top, r));
			const row: number[] = [];
			let used = 0;
			while (next < itemWidths.length) {
				const needed = used + (row.length > 0 ? columnGap : 0) + itemWidths[next];
				if (needed > available) break;
				used = needed;
				row.push(next++);
			}
			rows.push(row);
		}
		return { rows, placed: next };
	};

	const maxRows = Math.max(1, Math.floor((height - 2 * paddingY + rowGap) / rowStep));

	// Fewest rows that fit everything, centred vertically if possible, else pushed to the wider bottom.
	for (let rowCount = 1; rowCount <= maxRows; rowCount++) {
		const centred = (height - blockHeight(rowCount)) / 2;
		const bottom = height - paddingY - blockHeight(rowCount);
		for (const top of [centred, bottom]) {
			const { rows, placed } = fill(rowCount, top);
			if (placed === itemWidths.length && rows.every(row => row.length > 0)) {
				return { top, rows, hiddenCount: 0 };
			}
		}
	}

	const top = height - paddingY - blockHeight(maxRows);
	const { rows, placed } = fill(maxRows, top);
	if (placed === itemWidths.length) return { top, rows, hiddenCount: 0 };

	const lastRow = rows[rows.length - 1];
	const lastAvailable = widthAt(rowY(top, rows.length - 1));
	while (
		lastRow.length > 0 &&
		rowWidth(lastRow, itemWidths, columnGap) + columnGap + moreButtonWidth > lastAvailable
	) {
		lastRow.pop();
	}
	const visibleCount = rows.reduce((sum, row) => sum + row.length, 0);
	return { top, rows, hiddenCount: itemWidths.length - visibleCount };
};
