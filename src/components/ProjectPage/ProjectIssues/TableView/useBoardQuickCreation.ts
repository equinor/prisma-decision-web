import { useEffect, useRef, useState } from 'react';
import { IssueType } from '../../../../validators';
import { useSelectedProject } from '../../ProjectContext';

export type BoardComposerLocation = {
	type: Exclude<IssueType, 'Utility'>;
	position: 'top' | 'bottom';
};

export const useBoardQuickCreation = () => {
	const project = useSelectedProject();
	const [composer, setComposer] = useState<BoardComposerLocation | null>(null);
	const [highlightedIssueIds, setHighlightedIssueIds] = useState<string[]>([]);
	const highlightTimers = useRef(new Set<ReturnType<typeof setTimeout>>());
	const mounted = useRef(true);
	useEffect(() => {
		setComposer(null);
		setHighlightedIssueIds([]);
		highlightTimers.current.forEach(clearTimeout);
		highlightTimers.current.clear();
	}, [project.id]);
	useEffect(() => {
		mounted.current = true;
		const timers = highlightTimers.current;
		return () => {
			mounted.current = false;
			timers.forEach(clearTimeout);
		};
	}, []);

	const created = (id: string, source: BoardComposerLocation | null) => {
		if (!mounted.current) return;
		setComposer(current => (current === source ? null : current));
		setHighlightedIssueIds(current => [...current, id]);
		const timer = setTimeout(() => {
			setHighlightedIssueIds(current => current.filter(issueId => issueId !== id));
			highlightTimers.current.delete(timer);
		}, 2000);
		highlightTimers.current.add(timer);
	};

	return {
		composer,
		highlightedIssueIds,
		open: setComposer,
		close: () => setComposer(null),
		created,
	};
};
