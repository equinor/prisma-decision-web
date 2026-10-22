import { move } from '@dnd-kit/helpers';
import { DragDropEventHandlers } from '@dnd-kit/react';
import { useState } from 'react';
import type { BoardColumn } from '../components/ProjectPage/ProjectIssues/TableView/boardColumns';
import { Issue } from '../validators';
import { useUpdateIssuesOptimistic } from './api/useUpdateIssues';
import { useSelectedProjectIssues } from './useSelectedProjectIssues';
import { canDndStartFrom } from '../utils/canDndStartFrom';

type IssuesByColumn = Record<string, Issue[]>;

export const useIssueDragAndDrop = (columns: BoardColumn[]) => {
	const projectIssues = useSelectedProjectIssues();
	const issues: IssuesByColumn = Object.fromEntries(
		columns.map(column => [
			column.id,
			projectIssues.filter(column.matches).sort((a, b) => a.order - b.order),
		]),
	);
	const { mutate: updateIssues } = useUpdateIssuesOptimistic();

	const [tempIssues, setTempIssues] = useState<IssuesByColumn | null>(null);
	const localIssues = tempIssues ? tempIssues : issues;

	// Re-apply each column's value so moved cards show the column they are now in
	const assignColumns = (grouped: IssuesByColumn): IssuesByColumn =>
		Object.fromEntries(
			columns.map(column => [column.id, grouped[column.id].map(column.assign)]),
		);

	const onDragOver: DragDropEventHandlers['onDragOver'] = event => {
		const { source, target } = event.operation;
		const columnId = target?.type === 'column' ? target.id : target?.type;
		const column = columns.find(column => column.id === columnId);
		if (source && column) {
			source.data.issue = column.assign(source.data.issue);
		}
		const newTempIssues = tempIssues ? tempIssues : structuredClone(issues);

		setTempIssues(assignColumns(move(newTempIssues, event)));
	};

	const onDragEnd: DragDropEventHandlers['onDragEnd'] = () => {
		if (!tempIssues) return;
		const updatedIssues = columns.flatMap(column =>
			tempIssues[column.id].map((issue, index) => ({
				...column.assign(issue),
				order: index + 1,
			})),
		);
		setTempIssues(null);
		updateIssues(updatedIssues);
	};

	const onBeforeDragStart: DragDropEventHandlers['onBeforeDragStart'] = event => {
		if (!canDndStartFrom(event.operation.activatorEvent?.target)) {
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
