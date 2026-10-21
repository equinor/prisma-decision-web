import { useState } from 'react';
import { Objective, ObjectiveType } from '../validators';
import { childObjectiveType, parentObjectiveType, useObjectiveLinks } from './useObjectiveLinks';
import { useSelectedProjectObjectives } from './useSelectedProjectObjectives';

export type ObjectiveLinkSelection = { parentIds: string[]; childIds: string[] };

// Link selection for the create/edit forms; saved together with the objective
export const useObjectiveLinkSelection = (objectiveId?: string) => {
	const { links, setLinksFor } = useObjectiveLinks();
	const { selectedObjectives } = useSelectedProjectObjectives();
	const current = (): ObjectiveLinkSelection => ({
		parentIds: links.filter(link => link.child_id === objectiveId).map(link => link.parent_id),
		childIds: links.filter(link => link.parent_id === objectiveId).map(link => link.child_id),
	});
	const [selection, setSelection] = useState(current);

	const ofType = (ids: string[], type?: ObjectiveType) =>
		ids.filter(id => selectedObjectives.find(objective => objective.id === id)?.type === type);

	return {
		selection,
		setSelection,
		reset: () => setSelection(current()),
		// Only keeps links that fit the (possibly changed) type of the saved objective
		save: (objective: Objective) =>
			setLinksFor(
				objective.id,
				ofType(selection.parentIds, parentObjectiveType[objective.type]),
				ofType(selection.childIds, childObjectiveType[objective.type]),
			),
	};
};
