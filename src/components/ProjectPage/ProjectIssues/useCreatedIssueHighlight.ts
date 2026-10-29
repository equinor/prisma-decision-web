import { useCallback, useEffect, useRef, useState } from 'react';

export const useCreatedIssueHighlight = () => {
	const [highlightedIssueIds, setHighlightedIssueIds] = useState<ReadonlySet<string>>(new Set());
	const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
	const active = useRef(true);

	useEffect(() => {
		active.current = true;
		const currentTimers = timers.current;
		return () => {
			active.current = false;
			currentTimers.forEach(clearTimeout);
			currentTimers.clear();
		};
	}, []);

	const highlightCreatedIssue = useCallback((id: string) => {
		if (!active.current) return;
		clearTimeout(timers.current.get(id));
		setHighlightedIssueIds(current => new Set([...current, id]));
		timers.current.set(
			id,
			setTimeout(() => {
				timers.current.delete(id);
				setHighlightedIssueIds(current => {
					const next = new Set(current);
					next.delete(id);
					return next;
				});
			}, 2000),
		);
	}, []);

	return { highlightedIssueIds, highlightCreatedIssue };
};
