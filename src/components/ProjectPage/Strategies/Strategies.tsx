import { useState } from 'react';
import { CreateStrategy } from './CreateStrategy';
import { Strategy } from './Strategy';
import { StrategyTable } from './StrategyTable';
import { useHasInfluenceDiagramError } from '../../../hooks/useHasInfluenceDiagramError';
import { useSelectedProjectStrategies } from '../../../hooks/useSelectedProjectStrategies';
import { LoadingSpinner } from '../../common/LoadingSpinner';
import { useSelectedProject } from '../../../hooks/useSelectedProject';

export const Strategies = () => {
	const selectedProject = useSelectedProject();
	const { hasError: hasValidationError } = useHasInfluenceDiagramError();
	const { selectedStrategies, isLoading } = useSelectedProjectStrategies();
	const [selectedStrategyIds, setSelectedStrategyIds] = useState<Set<string>>(new Set());

	const selectedEvidence =
		selectedStrategies.map(s => ({
			evidence_id: s.id,
			state_ids: s.options.map(o => o.id),
		})) ?? [];

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
	const strategiesToCompare = selectedStrategies.filter(s => selectedStrategyIds.has(s.id)) ?? [];
	if (!selectedProject) return null;
	if (isLoading) return <LoadingSpinner />;
	return (
		<div className='flex flex-col gap-4'>
			<div className='flex items-center justify-between'>
				<h1 className='text-3xl font-bold'>{selectedProject.name}</h1>
				<CreateStrategy />
			</div>
			{selectedStrategies.length > 0 && <StrategyTable strategies={strategiesToCompare} />}
			<div
				className='bg-background-default shadow-tile flex w-full flex-col
            	items-start gap-4 rounded-sm p-4'
			>
				<div>
					<div className='flex gap-2'>
						<h2 className='text-2xl font-semibold'>Strategies</h2>
						<span className='bg-background-light flex w-8 items-center justify-center rounded-full'>
							{selectedStrategies.length ?? 0}
						</span>
					</div>
					<p className='text-text-tertiary'>
						Define and manage strategies for your decision optimization project
					</p>
				</div>
				{selectedStrategies.map(strategy => {
					return (
						<Strategy
							key={strategy.id}
							strategy={strategy}
							hasValidationError={hasValidationError}
							selectedStrategyIds={selectedStrategyIds}
							onClickAddToStrategyTable={handleClickAddToStrategyTable}
							selectedEvidenceData={selectedEvidence}
						/>
					);
				})}
			</div>
		</div>
	);
};
