import { useState } from 'react';
import { useGetExpectedValue } from '../../hooks/api/useGetExpectedValue';
import { useHasInfluenceDiagramError } from '../../hooks/useHasInfluenceDiagramError';
import { cn } from '../../utils/cn';
import { SolutionEvidenceResponse } from '../../validators';
import { InfluenceDiagramValidation } from '../ProjectPage/InfluenceDiagram/InfluenceDiagramValidation';
import { useSelectedProject } from '../ProjectPage/ProjectContext';

export const EVMetrics = ({
	selectedEvidence,
}: {
	selectedEvidence: SolutionEvidenceResponse[];
}) => {
	const selectedProject = useSelectedProject();
	const [showValidation, setShowValidation] = useState(false);
	const [validationAnchorEl, setValidationAnchorEl] = useState<HTMLButtonElement | null>(null);

	const formatEv = (value: number) => value.toFixed(2);
	const baseEvidence = [{ evidence_id: selectedProject.id, state_ids: [], expected_utility: 0 }];
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
	const selectedExpectedUtility = hasSelectedStateIds
		? selectedEvidenceData?.[0]?.expected_utility
		: undefined;
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
		<>
			<button
				ref={setValidationAnchorEl}
				type='button'
				disabled={!hasValidationError}
				aria-label={hasValidationError ? 'Open influence diagram validation' : undefined}
				className={cn('flex items-center gap-3 text-left', {
					'**:text-warning-resting hover:bg-background-warning focus-visible:bg-background-warning cursor-pointer rounded-sm px-2 py-0.5 transition-colors':
						hasValidationError,
				})}
				onClick={() => setShowValidation(prev => !prev)}
			>
				<div className='flex flex-col items-start justify-center'>
					<p className='text-text-tertiary text-[10px] uppercase'>Base EV</p>
					<p className='text-xs font-medium'>{baseEvValue}</p>
				</div>
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
			</button>
			<InfluenceDiagramValidation
				anchorEl={validationAnchorEl}
				open={showValidation}
				onClose={() => setShowValidation(false)}
			/>
		</>
	);
};
