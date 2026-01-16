import { Dialog, DialogContent, Button } from '@equinor/eds-core-react';
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
				<div className='flex flex-col gap-4 text-center'>
					<h2 className='text-2xl font-semibold'>Invalid influence diagram</h2>
					<p className='text-text-tertiary'>
						Your influence diagram is invalid. The decision tree cannot be calculated.
						Open Validation to see how you can fix it.
					</p>
				</div>
				<div className='flex flex-col gap-2'>
					<Button variant='outlined' onClick={handleStayOnDecisionTree}>
						Stay on Decision Tree
					</Button>
					<Button color='danger' onClick={handleNavigateToValidation}>
						Open Validation
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};

const getInfluenceDiagramPath = (currentPath: string): string => {
	return currentPath.replace(/\/decision-tree$/, '/influence-diagram');
};
