import { useState } from 'react';
import { useGetSolutionsWithEvidence } from '../../../hooks/api/useGetSolutionsWithEvidence';
import { useSelectedProject } from '../../../hooks/useSelectedProject';
import { CreateStrategy } from './CreateStrategy';
import { Strategy } from './Strategy';
import { StrategyTable } from './StrategyTable';
import { strategyIcons } from './icons';

export const Strategies = () => {
	const selectedProject = useSelectedProject();
	const [selectedStrategyIds, setSelectedStrategyIds] = useState<Set<string>>(new Set());

	const evidence = selectedProject?.strategies.map(s => ({
		evidence_id: s.id,
		state_ids: s.options.map(o => o.id),
	})) ?? [];

	const { data: solutionsData } = useGetSolutionsWithEvidence(selectedProject?.id, evidence);

	const handleClickAddToStrategyTable = (id: string) => {
		if (selectedStrategyIds.has(id)) {
			setSelectedStrategyIds(prev => {
				const newSet = new Set(prev);
				newSet.delete(id);
				return newSet;
			});
		} else {
			setSelectedStrategyIds(prev => {
				const newSet = new Set(prev);
				newSet.add(id);
				return newSet;
			});
		}
	};

	const selelectedStrategies =
		selectedProject?.strategies.filter(s => selectedStrategyIds.has(s.id)) ?? [];
	if (!selectedProject) return;
	return (
		<div className='flex flex-col gap-4'>
			<div className='flex items-center justify-between'>
				<h1 className='text-3xl font-bold'>{selectedProject.name}</h1>
				<CreateStrategy />
			</div>
			{selelectedStrategies.length > 0 && <StrategyTable strategies={selelectedStrategies} />}
			<div
				className='bg-background-default shadow-tile flex w-full flex-col
            	items-start gap-4 rounded-sm p-4'
			>
				<div>
					<div className='flex gap-2'>
						<h2 className='text-2xl font-semibold'>Strategies</h2>
						<span className='bg-background-light flex w-8 items-center justify-center rounded-full'>
							{selectedProject.strategies.length}
						</span>
					</div>
					<p className='text-text-tertiary'>
						Define and manage strategies for your decision optimization project
					</p>
				</div>
				{selectedProject.strategies.map((strategy) => {
				const expected_utility = solutionsData?.find(s => s.evidence_id === strategy.id)?.expected_utility;
					return (
						<Strategy
							strategyIcon={strategyIcons[strategy.icon]}
							key={strategy.id}
							strategy={strategy}
							selectedStrategyIds={selectedStrategyIds}
							onClickAddToStrategyTable={handleClickAddToStrategyTable}
							expected_utility={expected_utility}
						/>
					);
				})}
			</div>
		</div>
	);
};
