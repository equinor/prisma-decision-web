import { useGetExpectedValue } from '../../hooks/api/useGetExpectedValue';
import { useSelectedProject } from '../../hooks/useSelectedProject';
import { cn } from '../../utils/cn';
import { SolutionEvidenceRequest } from '../../validators';

export const EVMetrics = ({
	selectedEvidence,
}: {
	selectedEvidence?: SolutionEvidenceRequest[];
}) => {
	const selectedProject = useSelectedProject();

	const formatEv = (value: number) => value.toFixed(2);
	const baseEvidence =
		selectedProject?.id && selectedProject.strategies.length > 0
			? [{ evidence_id: selectedProject.id, state_ids: [] }]
			: [];
	const { data: baseEvidenceData, isLoading: isBaseEvPending } = useGetExpectedValue(
		baseEvidence,
		selectedProject?.id,
		true,
	);
	const { data: selectedEvidenceData, isLoading: isSelectedEvPending } = useGetExpectedValue(
		selectedEvidence ?? [],
		selectedProject?.id,
	);
	const baseExpectedUtility = baseEvidenceData?.[0]?.expected_utility;
	const expectedUtility = selectedEvidenceData?.[0]?.expected_utility;
	const evDelta =
		baseExpectedUtility !== undefined && expectedUtility !== undefined
			? expectedUtility - baseExpectedUtility
			: undefined;

	if (!selectedProject) return null;
	return (
		<div
			className={cn('flex items-center', {
				'gap-2': true,
				'flex-col items-start justify-center gap-1': false,
			})}
		>
			<div className='flex flex-col items-start justify-center'>
				<p className='text-text-tertiary text-[10px] uppercase'>Base EV</p>
				<p className='text-sm font-medium'>
					{isBaseEvPending
						? '…'
						: baseExpectedUtility !== undefined
							? formatEv(baseExpectedUtility)
							: '-'}
				</p>
			</div>
			<div className='bg-background-light h-7 w-px' />
			<div className='flex flex-col items-start justify-center'>
				<p className='text-text-tertiary text-[10px] uppercase'>Scenario EV</p>
				<p className='text-sm font-medium'>
					{isSelectedEvPending
						? '…'
						: expectedUtility !== undefined
							? formatEv(expectedUtility)
							: '-'}
				</p>
			</div>
			{evDelta !== undefined && (
				<div
					className={cn('bg-background-light rounded-sm px-2 py-1 text-xs font-medium', {
						'text-[#0A7D33]': evDelta > 0,
						'text-[#B42318]': evDelta < 0,
						'text-text-tertiary': evDelta === 0,
					})}
				>
					Δ {evDelta > 0 ? '+' : ''}
					{formatEv(evDelta)}
				</div>
			)}
		</div>
	);
};
