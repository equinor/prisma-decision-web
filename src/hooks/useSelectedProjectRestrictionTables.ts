import { useMemo } from 'react';
import { useSelectedProject } from '../components/ProjectPage/ProjectContext';
import { useGetRestrictionTables } from './api/useGetRestrictionTables';

export const useSelectedProjectRestrictionTables = () => {
	const selectedProject = useSelectedProject();
	const { restrictionTables, isFetching } = useGetRestrictionTables();
	const projectRestrictionTables = useMemo(
		() => restrictionTables.filter(table => table.project_id === selectedProject.id),
		[restrictionTables, selectedProject.id],
	);
	const restrictionEntriesByState = projectRestrictionTables.flatMap(table => [
		...Map.groupBy(table.restriction_entries, entry => entry.parent_state_id),
	]);
	const fullyRestrictedStateIds = [
		...new Set(
			restrictionEntriesByState
				.filter(([, entries]) => entries.every(entry => !entry.restriction_value))
				.map(([stateId]) => stateId),
		),
	];
	return {
		restrictionTables: projectRestrictionTables,
		fullyRestrictedStateIds,
		isFetching,
	};
};
