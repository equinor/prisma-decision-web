import { Type } from '@dnd-kit/abstract';
import { RestrictToElement } from '@dnd-kit/dom/modifiers';
import { move, arrayMove } from '@dnd-kit/helpers';
import { DragDropProvider, DragOverlay } from '@dnd-kit/react';
import { Issue } from '../ProjectPage';
import { DecisionCard } from './DecisionCard';
import { DecisionsColumn } from './DecisionsColumn';
import { FactCard } from './FactCard';
import { FactsColumn } from './FactsColumn';
import { UnassignedCard } from './UnassignedCard';
import { UnassignedColumn } from './UnassignedColumn';
import { UncertaintieCard } from './UncertaintieCard';
import { UncertaintiesColumn } from './UncertaintiesColumn';
import { ValueCard } from './ValueCard';
import { ValuesColumn } from './ValuesColumn';

type TableViewProps = {
	issues: Record<string, Issue[]>;
	setIssues: React.Dispatch<React.SetStateAction<Record<string, Issue[]>>>;
};

export const TableView = ({ issues, setIssues }: TableViewProps) => {
	return (
		<div
			className='bg-background-default shadow-tile flex w-full flex-col
        	items-start gap-6 rounded-sm p-6'
		>
			<h2 className='text-2xl font-semibold'>Issues</h2>
			<DragDropProvider
				onDragOver={event => {
					console.log(event.operation);
					if (event.operation?.target?.type === 'column' && event.operation.source) {
						event.operation.source.data.issue.type = event.operation.target.id;
					}
					setIssues(issues => {
						return move(issues, event);
					});
				}}
				modifiers={[RestrictToElement]}
			>
				<div className='grid w-full grid-cols-[repeat(5,minmax(257px,1fr))] gap-4 overflow-hidden'>
					<UnassignedColumn className='bg-blue-400/20' issues={issues['unassigned']} />
					<DecisionsColumn className='bg-red-400/20' issues={issues['decision']} />
					<UncertaintiesColumn
						className='bg-pink-400/20'
						issues={issues['uncertainty']}
					/>
					<ValuesColumn className='bg-emerald-400/20' issues={issues['value']} />
					<FactsColumn
						className='bg-cyan-400/20'
						issues={issues['fact']}
						onDeleteIssue={issue => {
							setIssues(prev => {
								const issues = prev['fact'];
								return {
									...prev,
									fact: issues.filter(x => x.id !== issue.id),
								};
							});
						}}
					/>
				</div>
				<DragOverlay>
					{source => {
						const Card = getCardType(source.type);
						return (
							<Card issue={source.data.issue} index={-1} onDeleteIssue={() => {}} />
						);
					}}
				</DragOverlay>
			</DragDropProvider>
		</div>
	);
};

const getCardType = (type?: Type) => {
	if (!type) return UnassignedCard;
	switch (type) {
		case 'decision':
			return DecisionCard;
		case 'uncertainty':
			return UncertaintieCard;
		case 'value':
			return ValueCard;
		case 'fact':
			return FactCard;
		default:
			return UnassignedCard;
	}
};
