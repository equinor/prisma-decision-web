import { Dialog, DialogContent, Button, Icon } from '@equinor/eds-core-react';
import { arrow_forward } from '@equinor/eds-icons';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';

export const InvalidDiagramDialog = () => {
	const navigate = useNavigate();
	const [showDialog, setShowDialog] = useState(true);

	const handleStayOnDecisionTree = useCallback(() => {
		setShowDialog(false);
	}, []);

	const handleNavigateToValidation = useCallback(() => {
		const validationPath = getInfluenceDiagramPath(window.location.pathname);
		navigate(validationPath);
	}, [navigate]);

	return (
		<Dialog
			open={showDialog}
			data-no-dnd
			className='nodrag nopan nowheel fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform'
		>
			<DialogContent>
				<div className='flex flex-col gap-2'>
					<div className='flex flex-col gap-2 text-center'>
						<h2 className='text-2xl font-semibold'>Invalid influence diagram</h2>
						<p className='text-text-tertiary'>
							Your influence diagram is invalid. The decision tree cannot be
							calculated. Open Validation to see how you can fix it.
						</p>
					</div>
					<div className='flex flex-col gap-2'>
						<Button variant='ghost' onClick={handleStayOnDecisionTree}>
							Stay on Decision Tree
						</Button>
						<Button variant='outlined' onClick={handleNavigateToValidation}>
							Go to influence diagram
							<Icon data={arrow_forward} />
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

const getInfluenceDiagramPath = (currentPath: string): string => {
	return currentPath.replace(/\/decision-tree$/, '/influence-diagram');
};
