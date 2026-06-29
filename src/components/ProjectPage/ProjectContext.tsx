import { createContext, use } from 'react';
import { project } from '../../validators';

export const ProjectContext = createContext<null | project>(null);
export const useSelectedProject = () => {
	const context = use(ProjectContext);
	if (!context) {
		throw new Error('useSelectedProject must be used within a ProjectContext.Provider');
	}
	return context;
};
