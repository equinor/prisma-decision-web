import { createContext, use } from 'react';
import { Issue, Option, Outcome } from '../../../validators';

export const useIssueCardContext = () => {
	const context = use(IssueCardContext);
	if (!context) {
		throw new Error('useIssueCardContext must be used within an IssueCardContext.Provider');
	}
	return context;
};

type IssueCardContextType = {
	issue: Issue;
	sortedStates: Option[] | Outcome[];
	setEditOpen: (open: boolean) => void;
	setDeleteOpen: (open: boolean) => void;
	selectedState?: Option | Outcome;
	onClickState?: (state: Option | Outcome) => void;
};

export const IssueCardContext = createContext<IssueCardContextType | null>(null);
