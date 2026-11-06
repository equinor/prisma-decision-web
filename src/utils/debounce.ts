export type DebouncedFunction<Args extends unknown[]> = ((...args: Args) => void) & {
	cancel: () => void;
};

export const debounce = <Args extends unknown[]>(
	callback: (...args: Args) => void,
	delay: number,
): DebouncedFunction<Args> => {
	let timeoutId: ReturnType<typeof setTimeout> | undefined;

	const debounced = (...args: Args) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => callback(...args), delay);
	};

	debounced.cancel = () => clearTimeout(timeoutId);
	return debounced;
};
