import { Dialog, DialogContent } from '@equinor/eds-core-react';
import { Issue } from '../../validators';
import { EditIssueForm } from './EditIssueForm';

export const EditIssueModal = ({ issue, onClose, open = false }: EditIssueModalProps) => {
	return (
		<Dialog
			data-no-dnd
			open={open}
			className='nodrag nopan nowheel pointer-events-auto fixed top-1/2 left-1/2 max-h-[90vh]
			w-[min(700px,90vw)]! -translate-x-1/2 -translate-y-1/2 transform cursor-auto overflow-auto'
		>
			<DialogContent>
				<EditIssueForm
					issue={issue}
					onClose={() => onClose(false)}
					onSuccess={() => onClose(false)}
				/>
			</DialogContent>
		</Dialog>
	);
};

type EditIssueModalProps = {
	issue: Issue;
	open?: boolean;
	onClose: (value: boolean) => void;
};
