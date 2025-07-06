import { RestrictToElement } from '@dnd-kit/dom/modifiers';
import { move } from '@dnd-kit/helpers';
import { DragDropProvider, DragOverlay } from '@dnd-kit/react';
import { useState } from 'react';
import { useSelectedProjectIssues } from '../../../hooks/useSelectedProjectIssues';
import { getCardType } from '../../../utils/getCardType';
import { groupByType } from '../../../utils/groupByType';
import { CreateIssues } from '../CreateIssue';
import { DecisionsColumn } from './DecisionsColumn';
import { FactsColumn } from './FactsColumn';
import { UnassignedColumn } from './UnassignedColumn';
import { UncertaintiesColumn } from './UncertaintiesColumn';
import { ValuesColumn } from './ValuesColumn';
import { Issue, issueTypes } from '../../../validators';
import { useUpdateIssues } from '../../../hooks/api/useUpdateIssues';

export const TableView = () => {
	const issues = groupByType(useSelectedProjectIssues());
	const { mutate: updateIssues } = useUpdateIssues();
	// eslint-disable-next-line func-call-spacing
	const [_localIssues, setLocalIssues] = useState<Record<
		(typeof issueTypes)[number],
		Issue[]
	> | null>(null);
	const localIssues = _localIssues ? _localIssues : issues;
	return (
		<>
			<CreateIssues />
			<DragDropProvider
				onDragOver={event => {
					if (event.operation?.target?.type === 'column' && event.operation.source) {
						event.operation.source.data.issue.type = event.operation.target.id;
					}
					if (event.operation?.target?.type !== 'column' && event.operation.source) {
						event.operation.source.data.issue.type = event.operation?.target?.type;
					}
					setLocalIssues(
						move(localIssues ? localIssues : structuredClone(issues), event),
					);
				}}
				onDragEnd={async event => {
					if (!localIssues) return;
					if (event.operation?.target?.type === 'column' && event.operation.source) {
						event.operation.source.data.issue.type = event.operation.target.id;
					}
					if (event.operation?.target?.type !== 'column' && event.operation.source) {
						event.operation.source.data.issue.type = event.operation?.target?.type;
					}
					const newIssues = Object.values(move(localIssues, event)).flat();
					await updateIssues(newIssues);
					setLocalIssues(null);
				}}
				modifiers={[RestrictToElement]}
			>
				<div
					className='bg-background-default shadow-tile flex w-full flex-col
        			items-start gap-6 rounded-sm p-6'
				>
					<div className='grid w-full grid-cols-[repeat(5,minmax(257px,1fr))] gap-4 overflow-auto'>
						<UnassignedColumn
							className='bg-blue-400/20'
							issues={localIssues['Unassigned']}
						/>
						<DecisionsColumn
							className='bg-red-400/20'
							issues={localIssues['Decision']}
						/>
						<UncertaintiesColumn
							className='bg-pink-400/20'
							issues={localIssues['Uncertainty']}
						/>
						<ValuesColumn className='bg-emerald-400/20' issues={localIssues['Value']} />
						<FactsColumn className='bg-cyan-400/20' issues={localIssues['Fact']} />
					</div>
				</div>
				<DragOverlay>
					{source => {
						const Card = getCardType(source.type);
						return <Card issue={source.data.issue} index={-1} />;
					}}
				</DragOverlay>
			</DragDropProvider>
		</>
	);
};
