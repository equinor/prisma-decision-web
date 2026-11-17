export type TreeConfiguration = { key: string; path: string[]; labels: string[] };

export type ParentCell = {
	column: number;
	label: string;
	rowSpan: number;
	groupKey?: string;
	collapsed: boolean;
};

export type DisplayRow<C extends TreeConfiguration> = {
	key: string;
	depth: number;
	path: string[];
	configurations: C[];
	groupKey?: string;
	parentCells: ParentCell[];
	summaryColSpan: number;
	divider: boolean;
};

export const getGroupKey = (path: string[], level: number) =>
	JSON.stringify(path.slice(0, level + 1));

const prefixKey = (row: { path: string[]; depth: number }, column: number) =>
	column < row.depth ? getGroupKey(row.path, column) : undefined;

export const buildDisplayRows = <C extends TreeConfiguration>(
	configurations: C[],
	parentCount: number,
	collapsed: ReadonlySet<string>,
): DisplayRow<C>[] => {
	const rows: Omit<DisplayRow<C>, 'parentCells' | 'divider'>[] = [];
	configurations.forEach(configuration => {
		const level = Array.from({ length: Math.max(0, parentCount - 1) }, (_, i) => i).find(i =>
			collapsed.has(getGroupKey(configuration.path, i)),
		);
		if (level === undefined) {
			rows.push({
				key: configuration.key,
				depth: parentCount,
				path: configuration.path,
				configurations: [configuration],
				summaryColSpan: 0,
			});
			return;
		}
		const groupKey = getGroupKey(configuration.path, level);
		const previous = rows.at(-1);
		if (previous?.groupKey === groupKey) {
			previous.configurations.push(configuration);
			return;
		}
		rows.push({
			key: `group:${groupKey}`,
			depth: level + 1,
			path: configuration.path.slice(0, level + 1),
			configurations: [configuration],
			groupKey,
			summaryColSpan: parentCount - level - 1,
		});
	});

	return rows.map((row, index) => {
		const previous = rows[index - 1];
		const parentCells: ParentCell[] = [];
		for (let column = 0; column < row.depth; column++) {
			const key = prefixKey(row, column);
			if (previous && prefixKey(previous, column) === key) continue;
			let rowSpan = 1;
			while (rows[index + rowSpan] && prefixKey(rows[index + rowSpan], column) === key)
				rowSpan++;
			const collapsible = column < parentCount - 1;
			parentCells.push({
				column,
				label: row.configurations[0].labels[column],
				rowSpan,
				groupKey: collapsible ? getGroupKey(row.path, column) : undefined,
				collapsed: collapsible && row.groupKey === getGroupKey(row.path, column),
			});
		}
		const firstChangedColumn = previous ? (parentCells[0]?.column ?? parentCount) : -1;
		return {
			...row,
			parentCells,
			divider: firstChangedColumn >= 0 && firstChangedColumn < parentCount - 1,
		};
	});
};
