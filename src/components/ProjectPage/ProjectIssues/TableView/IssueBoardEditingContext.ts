import { createContext, use } from 'react';

type IssueBoardEditing = {
	editing: boolean;
	setEditing: (editorId: string, active: boolean) => void;
};

export const IssueBoardEditingContext = createContext<IssueBoardEditing | null>(null);

export const useIssueBoardEditing = () => {
	const context = use(IssueBoardEditingContext);
	if (!context) throw new Error('useIssueBoardEditing must be used within an IssueBoardCard');
	return context;
};
