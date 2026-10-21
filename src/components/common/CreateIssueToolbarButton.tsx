import { Icon } from '@equinor/eds-core-react/next';
import { add } from '@equinor/eds-icons';
import { useState } from 'react';
import { useIssueForm } from '../../hooks/useIssueForm';
import { CreateIssueForm } from './CreateIssueForm';
import { ToolbarPopoverButton } from './DraggableToolbar/Toolbar';

export const CreateIssueToolbarButton = () => {
	const [isOpen, setIsOpen] = useState(false);
	const formMethods = useIssueForm({
		onSuccess: () => setIsOpen(false),
	});

	return (
		<ToolbarPopoverButton
			tone='accent'
			open={isOpen}
			onOpenChange={setIsOpen}
			trigger={
				<>
					<Icon data={add} />
					Create Issue
				</>
			}
			contentClassName='w-[min(640px,90vw)]'
		>
			<CreateIssueForm formMethods={formMethods} onClose={() => setIsOpen(false)} />
		</ToolbarPopoverButton>
	);
};
