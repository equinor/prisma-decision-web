import { Button, Icon, Menu } from '@equinor/eds-core-react';
import { edit } from '@equinor/eds-icons';
import { useState } from 'react';
import { useUpdateIssuesOptimistic } from '../../../../hooks/api/useUpdateIssues';
import { convertNodesToIssues } from '../../../../utils/convertNodesToIssues';
import { IssueType } from '../../../../validators';
import { useNodes } from '@xyflow/react';

export const ChangeIssueType = () => {
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
	const { mutate: updateIssues } = useUpdateIssuesOptimistic();
	const [isOpen, setIsOpen] = useState(false);
	const selectedIssues = useNodes().filter(node => node.selected);

	const handleIssueTypeChange = (newType: IssueType) => {
		const issues = convertNodesToIssues(selectedIssues);
		const updatedIssues = issues.map(issue => ({
			...issue,
			type: newType,
		}));
		updateIssues(updatedIssues);
		setIsOpen(false);
	};

	const noSelectedIssues = selectedIssues.length === 0;

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
