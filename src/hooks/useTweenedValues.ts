import { useEffect, useRef, useState } from 'react';

// Animates numeric values towards `targets` (eased); new keys jump straight to their target.
// Done in JS rather than CSS so dependants (e.g. SVG arcs) can follow every frame.
export const useTweenedValues = (targets: Record<string, number>, duration = 250) => {
	const [values, setValues] = useState(targets);
	const current = useRef(targets);

	useEffect(() => {
		const from = current.current;
		const start = performance.now();
		let frame = 0;
		const step = (now: number) => {
			const progress = Math.min(1, (now - start) / duration);
			const eased = 1 - (1 - progress) ** 3;
			const next = Object.fromEntries(
				Object.entries(targets).map(([key, target]) => [
					key,
					from[key] === undefined ? target : from[key] + (target - from[key]) * eased,
				]),
			);
			current.current = next;
			setValues(next);
			if (progress < 1) frame = requestAnimationFrame(step);
		};
		frame = requestAnimationFrame(step);
		return () => cancelAnimationFrame(frame);
	}, [targets, duration]);

	return values;
};
