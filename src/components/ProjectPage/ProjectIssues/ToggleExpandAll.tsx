import { Button } from '@equinor/eds-core-react';
import { useToggleAll } from '../../../hooks/useExpandCard';
import { useSelectedProjectIssues } from '../../../hooks/useSelectedProjectIssues';

export const ToggleExpandAll = () => {
	const { toggleAll, expandedCards } = useToggleAll();
	const issueIds = useSelectedProjectIssues().map(issue => issue.id);
	const shouldCollapse = expandedCards.size === issueIds.length;

	return (
		<Button variant='outlined' onClick={() => toggleAll(issueIds)}>
			{shouldCollapse ? 'Collapse All' : 'Expand All'}
		</Button>
	);
};
