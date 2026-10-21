import { Button } from '@equinor/eds-core-react';
import { useToggleAll } from '../../hooks/useExpandCard';
import { useSelectedProjectIssues } from '../../hooks/useSelectedProjectIssues';
import { ToolbarButton } from '../common/DraggableToolbar/Toolbar';

export const ToggleExpandAll = ({ toolbar = false }: { toolbar?: boolean }) => {
	const { toggleAll, expandedCards } = useToggleAll();
	const issueIds = useSelectedProjectIssues().map(issue => issue.id);
	const shouldCollapse = expandedCards.size === issueIds.length;
	const label = shouldCollapse ? 'Collapse All' : 'Expand All';
	const onClick = () => toggleAll(issueIds);

	if (toolbar) {
		return (
			<ToolbarButton tone='accent' onClick={onClick}>
				{label}
			</ToolbarButton>
		);
	}

	return (
		<Button variant='outlined' onClick={onClick}>
			{label}
		</Button>
	);
};
