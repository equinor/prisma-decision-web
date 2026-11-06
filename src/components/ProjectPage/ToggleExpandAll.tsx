import { Button } from '@equinor/eds-core-react';
import { useToggleAll } from '../../hooks/useExpandCard';
import { ToolbarButton } from '../common/DraggableToolbar/Toolbar';

export const ToggleExpandAll = ({
	toolbar = false,
	issueIds,
}: {
	toolbar?: boolean;
	issueIds: string[];
}) => {
	const { toggleAll, allExpanded } = useToggleAll(issueIds);
	const label = allExpanded ? 'Collapse All' : 'Expand All';
	const disabled = issueIds.length === 0;

	if (toolbar) {
		return (
			<ToolbarButton tone='accent' onClick={toggleAll} disabled={disabled}>
				{label}
			</ToolbarButton>
		);
	}

	return (
		<Button variant='outlined' onClick={toggleAll} disabled={disabled}>
			{label}
		</Button>
	);
};
