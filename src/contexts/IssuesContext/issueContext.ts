import { createContext } from 'react';
import { Issue } from '../../components/ProjectPage/ProjectPage';

type IssueContextType = {
	issues: Record<string, Issue[]>;
	handleDeleteIssue: (issue: Issue) => void;
	handleAddIssue: (issue: Issue) => void;
};

export const issueContext = createContext<IssueContextType | null>(null);
