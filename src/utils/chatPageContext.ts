export type ChatSection = 'objectives' | 'issues' | 'strategies' | 'influence_diagram';

export const getChatPageContext = (pathname: string) => {
	const [, root, projectId, section] = pathname.replace(/\/+/g, '/').split('/');
	const currentSection: ChatSection | undefined =
		section === 'objectives' || section === 'issues' || section === 'strategies'
			? section
			: section === 'influence-diagram'
				? 'influence_diagram'
				: undefined;
	return {
		projectId: root === 'project' ? projectId : undefined,
		currentSection: root === 'project' ? currentSection : undefined,
	};
};
