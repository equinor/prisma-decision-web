import { Button, Icon } from '@equinor/eds-core-react';
import { edit } from '@equinor/eds-icons';
import { useState } from 'react';
import { useSelectedProjectIssues } from '../../hooks/useSelectedProjectIssues';
import { cn } from '../../utils/cn';
import { getIssueColumnColor } from '../../utils/getIssueColumnColor';
import { DecisionCard } from '../common/Cards/DecisionCard';

const strategies = [
	{
		name: 'Improve decision-making processes',
		objective: 'Increase efficiency by 20%',
		rationale: 'Streamline workflows and reduce bottlenecks',
	},
	{
		name: 'Improve decision-making processes',
		objective: 'Increase efficiency by 20%',
		rationale: 'Streamline workflows and reduce bottlenecks',
	},
	{
		name: 'Improve decision-making processes',
		objective: 'Increase efficiency by 20%',
		rationale: 'Streamline workflows and reduce bottlenecks',
	},
];

export const Strategies = () => {
	const [selectedOptions, setSelectedOptions] = useState<
		{
			decisionId: string;
			selectedOption: string;
		}[]
	>([]);
	const decisions = useSelectedProjectIssues().filter(issue => issue.type === 'Decision');
	return strategies.map(strategy => (
		<div
			className='bg-background-default shadow-tile relative flex w-full
            flex-col items-start gap-4 rounded-sm p-4'
			key={strategy.name}
		>
			<Button variant='ghost_icon' className='absolute! top-2 right-2'>
				<Icon data={edit} />
			</Button>
			<h2 className='text-2xl font-semibold'>{strategy.name}</h2>
			<div className='grid w-full grid-cols-3'>
				<div>
					<label className='text-text-tertiary text-sm font-medium'>Strategy Name</label>
					<p>{strategy.name}</p>
				</div>
				<div>
					<label className='text-text-tertiary text-sm font-medium'>Objective</label>
					<p>{strategy.objective}</p>
				</div>
				<div>
					<label className='text-text-tertiary text-sm font-medium'>Rationale</label>
					<p>{strategy.rationale}</p>
				</div>
			</div>
			<div
				className={cn(
					getIssueColumnColor('Decision'),
					'flex w-full gap-2 overflow-auto rounded-sm p-2',
				)}
			>
				{decisions.map(decision => (
					<DecisionCard
						key={decision.id}
						issue={decision}
						className='h-fit max-w-[350px]'
						onSelectAlternative={selectedOption => {
							setSelectedOptions(prev => {
								const exists = prev.find(x => x.decisionId === decision.id);
								if (!exists)
									return [...prev, { decisionId: decision.id, selectedOption }];
								return prev.map(x =>
									x.decisionId === decision.id ? { ...x, selectedOption } : x,
								);
							});
						}}
						selectedOptions={selectedOptions.map(x => x.selectedOption)}
					/>
				))}
			</div>
		</div>
	));
};
