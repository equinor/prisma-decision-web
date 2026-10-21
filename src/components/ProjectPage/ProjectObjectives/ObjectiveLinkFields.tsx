import { Autocomplete } from '@equinor/eds-core-react';
import { Control, useWatch } from 'react-hook-form';
import { ObjectiveLinkSelection } from '../../../hooks/useObjectiveLinkSelection';
import {
	childObjectiveType,
	objectiveTypeLabel,
	parentObjectiveType,
} from '../../../hooks/useObjectiveLinks';
import { useSelectedProjectObjectives } from '../../../hooks/useSelectedProjectObjectives';
import { Objective, ObjectiveType } from '../../../validators';

type ObjectiveLinkFieldsProps = {
	control: Control<Objective>;
	selection: ObjectiveLinkSelection;
	onChange: (selection: ObjectiveLinkSelection) => void;
};

export const ObjectiveLinkFields = ({ control, selection, onChange }: ObjectiveLinkFieldsProps) => {
	const [type, id] = useWatch({ control, name: ['type', 'id'] });
	const { selectedObjectives } = useSelectedProjectObjectives();
	const parentType = parentObjectiveType[type];
	const childType = childObjectiveType[type];
	const optionsOf = (optionType?: ObjectiveType) =>
		optionType
			? selectedObjectives.filter(
					objective => objective.type === optionType && objective.id !== id,
				)
			: [];
	const parentOptions = optionsOf(parentType);
	const childOptions = optionsOf(childType);

	return (
		<>
			{parentType && parentOptions.length > 0 && (
				<Autocomplete
					label={`Contributes to (${objectiveTypeLabel[parentType].toLowerCase()} objectives)`}
					multiple
					options={parentOptions}
					optionLabel={objective => objective.name}
					selectedOptions={parentOptions.filter(objective =>
						selection.parentIds.includes(objective.id),
					)}
					placeholder='Select objectives...'
					onOptionsChange={({ selectedItems }) =>
						onChange({ ...selection, parentIds: selectedItems.map(item => item.id) })
					}
				/>
			)}
			{childType && childOptions.length > 0 && (
				<Autocomplete
					label={`Supported by (${objectiveTypeLabel[childType].toLowerCase()} objectives)`}
					multiple
					options={childOptions}
					optionLabel={objective => objective.name}
					selectedOptions={childOptions.filter(objective =>
						selection.childIds.includes(objective.id),
					)}
					placeholder='Select objectives...'
					onOptionsChange={({ selectedItems }) =>
						onChange({ ...selection, childIds: selectedItems.map(item => item.id) })
					}
				/>
			)}
		</>
	);
};
