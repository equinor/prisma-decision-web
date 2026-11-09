import { move } from '@dnd-kit/helpers';
import { DragDropEventHandlers } from '@dnd-kit/react';
import { useState } from 'react';
import {
	groupIssuesForBoard,
	IssueBoardFocus,
	moveIssueToBoardGroup,
} from '../components/ProjectPage/ProjectIssues/TableView/issueBoardFocus';
import { Issue } from '../validators';
import { useUpdateIssuesOptimistic } from './api/useUpdateIssues';
import { useSelectedProjectIssues } from './useSelectedProjectIssues';
import { canDndStartFrom } from '../utils/canDndStartFrom';

export const useIssueDragAndDrop = (focus: IssueBoardFocus = 'Overview') => {
	const savedIssues = useSelectedProjectIssues();
	const issues = groupIssuesForBoard(focus, savedIssues);
	const { mutate: updateIssues } = useUpdateIssuesOptimistic();

	const [tempIssues, setTempIssues] = useState<Record<string, Issue[]> | null>(null);
	const localIssues = tempIssues ? tempIssues : issues;

	const onDragOver: DragDropEventHandlers['onDragOver'] = event => {
		const source = event.operation.source;
		const target = event.operation.target;
		if (source && target) {
			const targetGroup = String(target.type === 'column' ? target.id : target.type);
			Object.assign(
				source.data.issue,
				moveIssueToBoardGroup(focus, targetGroup, source.data.issue),
			);
		}

		setTempIssues(move(tempIssues ?? structuredClone(issues), event));
	};

	const onDragEnd: DragDropEventHandlers['onDragEnd'] = () => {
		if (!tempIssues) return;
		const updatedIssues = Object.entries(tempIssues).flatMap(([group, groupIssues]) =>
			groupIssues.map((issue, index) => ({
				...moveIssueToBoardGroup(focus, group, issue),
				order: index + 1,
			})),
		);
		setTempIssues(null);
		updateIssues(updatedIssues);
	};

	const onBeforeDragStart: DragDropEventHandlers['onBeforeDragStart'] = event => {
		if (
			event.operation.source?.data.editing === true ||
			!canDndStartFrom(event.operation.activatorEvent?.target)
		) {
			event.preventDefault();
		}
	};

	return {
		issues: localIssues,
		onDragEnd,
		onDragOver,
		onBeforeDragStart,
	};
};
