import { move } from '@dnd-kit/helpers';
import { DragDropEvents } from '@dnd-kit/react';
import { useState } from 'react';
import { groupByIssueType } from '../utils/groupByIssueType';
import { IssueType, Issue } from '../validators';
import { useUpdateIssuesOptimistic } from './api/useUpdateIssues';
import { useSelectedProjectIssues } from './useSelectedProjectIssues';

export const useIssueDragAndDrop = () => {
	const issues = groupByIssueType(useSelectedProjectIssues());
	const { mutate: updateIssues } = useUpdateIssuesOptimistic();

	const [tempIssues, setTempIssues] = useState<Record<IssueType, Issue[]> | null>(null);
	const localIssues = tempIssues ? tempIssues : issues;

	const onDragOver: DragDropEvents['dragover'] = event => {
		if (event.operation?.target?.type === 'column' && event.operation.source) {
			event.operation.source.data.issue.type = event.operation.target.id;
		}
		if (event.operation?.target?.type !== 'column' && event.operation.source) {
			event.operation.source.data.issue.type = event.operation?.target?.type;
		}
		const newTempIssues = tempIssues ? tempIssues : structuredClone(issues);

		setTempIssues(move(newTempIssues, event));
	};

	const onDragEnd: DragDropEvents['dragend'] = () => {
		if (!tempIssues) return;
		Object.keys(tempIssues).forEach(key => {
			tempIssues[key as IssueType].forEach((issue, index) => {
				issue.type = key as IssueType;
				issue.order = index + 1;
			});
		});
		const updatedIssues = Object.values(tempIssues).flat();
		setTempIssues(null);
		updateIssues(updatedIssues);
	};

	return {
		issues: localIssues,
		onDragEnd,
		onDragOver,
	};
};
