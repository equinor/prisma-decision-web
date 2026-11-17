import { useCallback, useSyncExternalStore } from 'react';
import { Definition } from './probabilityTableMath';

export type NoisyMaxSettings = {
	enabled: boolean;
	view: 'parameters' | 'full';
	/** parent issue id → state id */
	baselines: Record<string, string>;
	/** outcome id → probability */
	leak: Record<string, number>;
	/** parent issue id → state id → outcome id → probability. Kept when the baseline changes. */
	rows: Record<string, Record<string, Record<string, number>>>;
};

export type ProbabilityTableSettings = {
	definitions: Record<string, Definition>;
	locks: Record<string, string[]>;
	collapsed: string[];
	/** Outcome ids low → high. Used by definitions and Noisy-MAX; the columns keep their order. */
	outcomeOrder: string[];
	keepRowsAtOne: boolean;
	noisyMax?: NoisyMaxSettings;
};

const emptySettings: ProbabilityTableSettings = {
	definitions: {},
	locks: {},
	collapsed: [],
	outcomeOrder: [],
	keepRowsAtOne: false,
};
const cache = new Map<string, ProbabilityTableSettings>();
const listeners = new Set<() => void>();

const read = (key: string): ProbabilityTableSettings => {
	const cached = cache.get(key);
	if (cached) return cached;
	let value = emptySettings;
	try {
		const stored = localStorage.getItem(key);
		if (stored) value = { ...emptySettings, ...JSON.parse(stored) };
	} catch {
		value = emptySettings;
	}
	cache.set(key, value);
	return value;
};

const subscribe = (listener: () => void) => {
	listeners.add(listener);
	return () => listeners.delete(listener);
};

// Definitions, locks, collapsed groups, scale order and Noisy-MAX parameters have no API yet,
// so they live in the browser.
// One shared store keeps every open copy of a table (diagram node, side sheet) in sync.
export const useProbabilityTableSettings = (issueId: string) => {
	const storageKey = `probability-table:${issueId}`;
	const settings = useSyncExternalStore(subscribe, () => read(storageKey));

	const update = useCallback(
		(change: (previous: ProbabilityTableSettings) => ProbabilityTableSettings) => {
			const next = change(read(storageKey));
			cache.set(storageKey, next);
			localStorage.setItem(storageKey, JSON.stringify(next));
			listeners.forEach(listener => listener());
		},
		[storageKey],
	);

	return [settings, update] as const;
};
