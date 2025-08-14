import { RestrictToElement } from '@dnd-kit/dom/modifiers';
import { move } from '@dnd-kit/helpers';
import { DragDropProvider, DragOverlay } from '@dnd-kit/react';
import { useState } from 'react';
import { useUpdateIssuesOptimistic } from '../../../hooks/api/useUpdateIssues';
import { useSelectedProjectIssues } from '../../../hooks/useSelectedProjectIssues';
import { Issue, IssueType, issueTypes } from '../../../validators';
import { IssueColumn } from './IssueColumn';
import { groupByIssueType } from '../../../utils/groupByIssueType';
import { getIssueCardType } from '../../../utils/getIssueCardType';

export const TableView = () => {
	const issues = groupByIssueType(useSelectedProjectIssues());
	const { mutate: updateIssues } = useUpdateIssuesOptimistic();

	const [tempIssues, setTempIssues] = useState<Record<IssueType, Issue[]> | null>(null);
	const localIssues = tempIssues ? tempIssues : issues;
	return (
		<DragDropProvider
			onDragOver={event => {
				if (event.operation?.target?.type === 'column' && event.operation.source) {
					event.operation.source.data.issue.type = event.operation.target.id;
				}
				if (event.operation?.target?.type !== 'column' && event.operation.source) {
					event.operation.source.data.issue.type = event.operation?.target?.type;
				}
				const newTempIssues = tempIssues ? tempIssues : structuredClone(issues);

				setTempIssues(move(newTempIssues, event));
			}}
			onDragEnd={() => {
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
			}}
			modifiers={[RestrictToElement]}
		>
			<div className='bg-background-default shadow-tile h-[calc(100vh-285px)] w-full rounded-sm p-4'>
				<div className='flex h-full w-full gap-4 overflow-auto'>
					{issueTypes.map(issueType => (
						<IssueColumn
							key={issueType}
							issues={localIssues[issueType]}
							issueType={issueType}
							label={issueType}
						/>
					))}
				</div>
			</div>
			<DragOverlay>
				{source => {
					const Card = getIssueCardType(source.type as IssueType);
					return <Card issue={source.data.issue} />;
				}}
			</DragOverlay>
		</DragDropProvider>
	);
};
