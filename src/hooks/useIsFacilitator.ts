import { useGetSignUser } from './api/useGetSignUser';
import { useSelectedProject } from './useSelectedProject';

export const useIsFacilitator = () => {
	const selectedProject = useSelectedProject();
	const { signuser } = useGetSignUser();
	return (
		selectedProject?.users.find(u => u.user_id === signuser?.user_id)?.role === 'Facilitator'
	);
};
