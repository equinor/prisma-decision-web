import { RestrictToElement } from '@dnd-kit/dom/modifiers';
import { move } from '@dnd-kit/helpers';
import { DragDropProvider, DragOverlay } from '@dnd-kit/react';
import { useState } from 'react';
import { CreateIssues } from '../CreateIssue';
import { Issue } from '../ProjectPage';
import { DecisionsColumn } from './DecisionsColumn';
import { FactsColumn } from './FactsColumn';
import { UnassignedColumn } from './UnassignedColumn';
import { UncertaintiesColumn } from './UncertaintiesColumn';
import { ValuesColumn } from './ValuesColumn';
import { getCardType } from '../../../utils/getCardType';

export const TableView = () => {
	const [issues, setIssues] = useState(defaultIssues);
	return (
		<>
			<CreateIssues />
			<DragDropProvider
				onDragOver={event => {
					if (event.operation?.target?.type === 'column' && event.operation.source) {
						event.operation.source.data.issue.type = event.operation.target.id;
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

const defaultIssues: Record<string, Issue[]> = {
	decision: [
		{
			type: 'decision',
			name: 'Decision 1',
			id: crypto.randomUUID(),
			description: '',
		},
		{
			type: 'decision',
			name: 'Decision 2',
			id: crypto.randomUUID(),
			description: '',
		},
		{
			type: 'decision',
			name: 'asdqwdq ',
			id: crypto.randomUUID(),
			description: '',
		},
		{
			type: 'decision',
			name: '2424rfevwef',
			id: crypto.randomUUID(),
			description: '',
		},
		{
			type: 'decision',
			name: 'Decision 2',
			id: crypto.randomUUID(),
			description: '',
		},
	],
	uncertainty: [
		{
			type: 'uncertainty',
			name: 'Uncertainties 3',
			id: crypto.randomUUID(),
			description: '',
		},
		{
			type: 'uncertainty',
			name: 'wefv42fvwef',
			id: crypto.randomUUID(),
			description: '',
		},
		{
			type: 'uncertainty',
			name: 'bgern535b35gb',
			id: crypto.randomUUID(),
			description: '',
		},
	],
	value: [
		{
			type: 'value',
			name: 'Uncertainties 4',
			id: crypto.randomUUID(),
			description: '',
		},
		{
			type: 'value',
			name: 'k768j567hgv5v3gr',
			id: crypto.randomUUID(),
			description: '',
		},
		{
			type: 'value',
			name: 'e5t35bt3tb5',
			id: crypto.randomUUID(),
			description: '',
		},
	],
	fact: [
		{
			type: 'fact',
			name: 'hrt h4tb4hbh4t',
			id: crypto.randomUUID(),
			description: '',
		},
	],
	unassigned: [],
};
