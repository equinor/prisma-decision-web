import { Autocomplete } from '@equinor/eds-core-react';
import { useInfluenceDiagramEvidence } from '../../../hooks/useInfluenceDiagramEvidence';
import { useSelectedProjectRestrictionTables } from '../../../hooks/useSelectedProjectRestrictionTables';
import { Issue } from '../../../validators';

export const ForceStateSelect = ({ issue }: { issue: Issue }) => {
	const { evidence, toggleEvidence } = useInfluenceDiagramEvidence();
	const { fullyRestrictedStateIds } = useSelectedProjectRestrictionTables();
	const states: { id: string; name: string }[] =
		issue.type === 'Decision'
			? issue.decision.options
			: issue.type === 'Uncertainty'
				? issue.uncertainty.outcomes
				: [];
	if (!states.length) return null;

	const stateLabel = issue.type === 'Decision' ? 'option' : 'outcome';
	const selected = states.find(state => evidence.includes(state.id));
	const select = (stateId: string | undefined) => {
		if (stateId === selected?.id) return;
		// toggleEvidence clears when given the current id, otherwise replaces it
		toggleEvidence(stateId ?? selected!.id, issue.id);
	};

	return (
		<Autocomplete
			label={`Forced ${stateLabel}`}
			placeholder='None'
			options={states}
			optionLabel={state => state.name || 'Unnamed'}
			selectedOptions={selected ? [selected] : []}
			optionDisabled={state =>
				fullyRestrictedStateIds.includes(state.id) && state.id !== selected?.id
			}
			onOptionsChange={({ selectedItems }) => select(selectedItems[0]?.id)}
		/>
	);
};
