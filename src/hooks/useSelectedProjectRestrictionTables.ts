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
	return {
		restrictionTables: projectRestrictionTables,
		isFetching,
	};
};
