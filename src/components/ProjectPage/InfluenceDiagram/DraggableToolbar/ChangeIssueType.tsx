import { Button, Icon, Menu } from '@equinor/eds-core-react';
import { edit } from '@equinor/eds-icons';
import { useNodes } from '@xyflow/react';
import { useState } from 'react';
import { useUpdateIssuesOptimistic } from '../../../../hooks/api/useUpdateIssues';
import { useSelectedProjectIssues } from '../../../../hooks/useSelectedProjectIssues';
import { ReactFlowInfluenceNode } from '../../../../types';
import { IssueType } from '../../../../validators';

export const ChangeIssueType = () => {
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
	const { mutate: updateIssues } = useUpdateIssuesOptimistic();
	const [isOpen, setIsOpen] = useState(false);
	const projectIssues = useSelectedProjectIssues();
	const selectedNodes = useNodes<ReactFlowInfluenceNode>().filter(node => node.selected);

	const handleIssueTypeChange = (newType: IssueType) => {
		const issues = projectIssues.filter(issue =>
			selectedNodes.some(node => node.data.issue_id === issue.id),
		);
		const updatedIssues = issues.map(issue => ({
			...issue,
			type: newType,
		}));
		updateIssues(updatedIssues);
		setIsOpen(false);
	};

	const noSelectedIssues = selectedNodes.length === 0;

	return (
		<>
			<Button
				className='px-1.5!'
				disabled={noSelectedIssues}
				onClick={() => setIsOpen(prev => !prev)}
				ref={setAnchorEl}
				variant='outlined'
			>
				<Icon data={edit} />
			</Button>
			<Menu open={isOpen} anchorEl={anchorEl} onClose={() => setIsOpen(false)}>
				<Menu.Item onClick={() => handleIssueTypeChange('Fact')}>Fact</Menu.Item>
				<Menu.Item onClick={() => handleIssueTypeChange('Decision')}>Decision</Menu.Item>
				<Menu.Item onClick={() => handleIssueTypeChange('Uncertainty')}>
					Uncertainty
				</Menu.Item>
				<Menu.Item onClick={() => handleIssueTypeChange('Unassigned')}>
					Unassigned
				</Menu.Item>
			</Menu>
		</>
	);
};
