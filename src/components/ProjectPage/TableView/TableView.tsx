import { RestrictToElement } from '@dnd-kit/dom/modifiers';
import { move } from '@dnd-kit/helpers';
import { DragDropProvider, DragOverlay } from '@dnd-kit/react';
import { getCardType } from '../../../utils/getCardType';
import { CreateIssues } from '../CreateIssue';
import { useIssuesContext } from '../ProjectPage';
import { DecisionsColumn } from './DecisionsColumn';
import { FactsColumn } from './FactsColumn';
import { UnassignedColumn } from './UnassignedColumn';
import { UncertaintiesColumn } from './UncertaintiesColumn';
import { ValuesColumn } from './ValuesColumn';

export const TableView = () => {
	const { issues, setIssues } = useIssuesContext();
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
					setIssues(issues => {
						return move(issues, event);
					});
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
							issues={issues['unassigned']}
						/>
						<DecisionsColumn className='bg-red-400/20' issues={issues['decision']} />
						<UncertaintiesColumn
							className='bg-pink-400/20'
							issues={issues['uncertainty']}
						/>
						<ValuesColumn className='bg-emerald-400/20' issues={issues['value']} />
						<FactsColumn className='bg-cyan-400/20' issues={issues['fact']} />
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
