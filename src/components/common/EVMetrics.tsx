import { Tooltip } from '@equinor/eds-core-react';
import { useGetExpectedValue } from '../../hooks/api/useGetExpectedValue';
import { cn } from '../../utils/cn';
import { SolutionEvidenceRequest } from '../../validators';
import { useSelectedProject } from '../ProjectPage/ProjectContext';
import { useHasInfluenceDiagramError } from '../../hooks/useHasInfluenceDiagramError';

export const EVMetrics = ({
	selectedEvidence,
}: {
	selectedEvidence: SolutionEvidenceRequest[];
}) => {
	const selectedProject = useSelectedProject();

	const formatEv = (value: number) => value.toFixed(2);
	const baseEvidence = [{ evidence_id: selectedProject.id, state_ids: [] }];
	const { data: baseEvidenceData, isLoading: isBaseEvPending } = useGetExpectedValue(
		baseEvidence,
		selectedProject.id,
		true,
	);
	const hasSelectedStateIds = selectedEvidence.some(item => item.state_ids.length > 0);
	const { data: selectedEvidenceData, isLoading: isSelectedEvPending } = useGetExpectedValue(
		selectedEvidence,
		selectedProject.id,
		hasSelectedStateIds,
	);
	const baseExpectedUtility = baseEvidenceData?.[0]?.expected_utility;
	const selectedExpectedUtility = selectedEvidenceData?.[0]?.expected_utility;
	const evDelta =
		baseExpectedUtility !== undefined && selectedExpectedUtility !== undefined
			? selectedExpectedUtility - baseExpectedUtility
			: undefined;

	const { hasError: hasValidationError } = useHasInfluenceDiagramError();

	let baseEvValue = '-';
	if (baseExpectedUtility) baseEvValue = formatEv(baseExpectedUtility);
	if (isBaseEvPending) baseEvValue = '...';
	if (hasValidationError) baseEvValue = 'Error';

	let scenarioEvValue = '-';
	if (selectedExpectedUtility) scenarioEvValue = formatEv(selectedExpectedUtility);
	if (!hasSelectedStateIds) scenarioEvValue = 'Select states';
	if (isSelectedEvPending) scenarioEvValue = '...';
	if (hasValidationError) scenarioEvValue = 'Error';

	return (
		<Tooltip title='Can not calculate EV with an invalid influence diagram'>
			<div
				className={cn('flex items-center ', {
					'gap-2': true,
					'flex-col items-start justify-center gap-1': false,
					'**:text-text-danger  outline-text-danger rounded-sm px-2  py-0.5 outline-2 dark:outline-red-400 dark:**:text-red-400':
						hasValidationError,
				})}
			>
				<div className='flex flex-col items-start justify-center'>
					<p className='text-text-tertiary text-[10px] uppercase'>Base EV</p>
					<p className='text-xs font-medium'>{baseEvValue}</p>
				</div>
				<div className='bg-background-light h-7 w-px' />
				<div className='flex flex-col items-start justify-center'>
					<p className='text-text-tertiary text-[10px] uppercase'>Scenario EV</p>
					<p className='text-xs font-medium'>{scenarioEvValue}</p>
				</div>
				{evDelta !== undefined && (
					<div
						className={cn(
							'bg-background-light rounded-sm px-2 py-1 text-xs font-medium',
							{
								'text-[#0A7D33]': evDelta > 0,
								'text-[#B42318]': evDelta < 0,
								'text-text-tertiary': evDelta === 0,
							},
						)}
					>
						Δ {evDelta > 0 ? '+' : ''}
						{formatEv(evDelta)}
					</div>
				)}
			</div>
		</Tooltip>
	);
};
