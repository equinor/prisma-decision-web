import { useSelectedProject } from '../components/ProjectPage/ProjectContext';
import { useGetSignUser } from './api/useGetSignUser';

export const useIsFacilitator = () => {
	const { signuser } = useGetSignUser();
	const selectedProject = useSelectedProject();
	return selectedProject.users.find(u => u.user_id === signuser?.user_id)?.role === 'Facilitator';
};
