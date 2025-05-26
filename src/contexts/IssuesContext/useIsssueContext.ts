import { useContext } from 'react';
import { issueContext } from './issueContext';

export const useIssuesContext = () => {
	const context = useContext(issueContext);
	if (!context) {
		throw new Error('useIssuesContext must be used within a IssueContextProvider');
	}
	return context;
};
