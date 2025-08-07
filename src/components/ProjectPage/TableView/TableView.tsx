import { RestrictToElement } from '@dnd-kit/dom/modifiers';
import { move } from '@dnd-kit/helpers';
import { DragDropProvider, DragOverlay } from '@dnd-kit/react';
import { useState } from 'react';
import { useUpdateIssuesOptimistic } from '../../../hooks/api/useUpdateIssues';
import { useSelectedProjectIssues } from '../../../hooks/useSelectedProjectIssues';
import { getCardType } from '../../../utils/getCardType';
import { groupByType } from '../../../utils/groupByType';
import { Issue, IssueType } from '../../../validators';
import { IssueColumn } from './IssueColumn';

export const TableView = () => {
	const issues = groupByType(useSelectedProjectIssues());
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
				<div className='grid h-full w-full grid-cols-[repeat(5,minmax(257px,1fr))] gap-4 overflow-auto'>
					<IssueColumn
						className='bg-blue-400/20'
						issues={localIssues['Unassigned']}
						issueType='Unassigned'
						label='Unassigned'
					/>
					<IssueColumn
						className='bg-red-400/20'
						issues={localIssues['Decision']}
						issueType='Decision'
						label='Decisions'
					/>
					<IssueColumn
						className='bg-pink-400/20'
						issues={localIssues['Uncertainty']}
						issueType='Uncertainty'
						label='Uncertainties'
					/>
					<IssueColumn
						className='bg-emerald-400/20'
						issues={localIssues['Value Metric']}
						issueType='Value Metric'
						label='Value Metrics'
					/>
					<IssueColumn
						className='bg-cyan-400/20'
						issues={localIssues['Fact']}
						issueType='Fact'
						label='Facts'
					/>
				</div>
			</div>
			<DragOverlay>
				{source => {
					const Card = getCardType(source.type as IssueType);
					return <Card issue={source.data.issue} />;
				}}
			</DragOverlay>
		</DragDropProvider>
	);
};
