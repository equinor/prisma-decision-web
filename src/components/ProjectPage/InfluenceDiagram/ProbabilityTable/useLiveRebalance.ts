import { useCallback, useEffect, useRef, useState } from 'react';
import { fillLastEmpty, ProbabilityCell, rebalanceRow } from './probabilityTableMath';

type Live = { rowKey: string; index: number; value: number };
export type RowPreview = {
	/** Values to show: the other cells as rebalanced, the typed cell as stored */
	values: number[];
	/** Values to sum, including the typed value */
	sumCells: ProbabilityCell[];
	adjusted: Set<number>;
};

const FLASH_MS = 1000;

/**
 * Changes the tool makes to a row while the user types in it. Always: the last empty cell gets
 * the rest. With "Keep rows at 1" on: the other unlocked cells change in proportion instead.
 * The change is previewed while typing and saved on commit; changed cells stay highlighted for
 * a moment so the user sees what moved.
 */
export const useLiveRebalance = (keepRowsAtOne: boolean) => {
	const adjust = keepRowsAtOne ? rebalanceRow : fillLastEmpty;
	const [live, setLive] = useState<Live | null>(null);
	const [flash, setFlash] = useState<{ rowKey: string; indexes: number[] } | null>(null);
	const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
	useEffect(() => () => clearTimeout(timer.current), []);

	const preview = (rowKey: string, cells: ProbabilityCell[]): RowPreview => {
		const stored = cells.map(cell => cell.value);
		if (live?.rowKey === rowKey) {
			const next = adjust(cells, live.index, live.value);
			const adjusted = new Set(
				next.flatMap((value, i) => (i !== live.index && value !== stored[i] ? [i] : [])),
			);
			return {
				values: next.map((value, i) => (i === live.index ? stored[i] : value)),
				sumCells: cells.map((cell, i) => ({ ...cell, value: next[i] })),
				adjusted,
			};
		}
		return {
			values: stored,
			sumCells: cells,
			adjusted: new Set(flash?.rowKey === rowKey ? flash.indexes : []),
		};
	};

	const draft = useCallback(
		(rowKey: string, index: number, value: number | undefined) =>
			setLive(previous => {
				if (value !== undefined) return { rowKey, index, value };
				return previous?.rowKey === rowKey && previous.index === index ? null : previous;
			}),
		[],
	);

	/** Values to save for one row after the user commits a cell */
	const commit = (
		rowKey: string,
		cells: ProbabilityCell[],
		index: number,
		value: number,
	): number[] => {
		const next = adjust(cells, index, value);
		const indexes = next.flatMap((v, i) => (i !== index && v !== cells[i].value ? [i] : []));
		if (indexes.length) {
			clearTimeout(timer.current);
			setFlash({ rowKey, indexes });
			timer.current = setTimeout(() => setFlash(null), FLASH_MS);
		}
		return next;
	};

	return { preview, draft, commit };
};
