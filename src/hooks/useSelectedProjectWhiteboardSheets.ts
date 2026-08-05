import { useSelectedProject } from '../components/ProjectPage/ProjectContext';
import { useGetWhiteboardSheets } from './api/useGetWhiteboardSheets';

export const useSelectedProjectWhiteboardSheets = () => {
	const selectedProject = useSelectedProject();
	const { data: sheets } = useGetWhiteboardSheets();
	return sheets.filter(s => s.project_id === selectedProject.id);
};
