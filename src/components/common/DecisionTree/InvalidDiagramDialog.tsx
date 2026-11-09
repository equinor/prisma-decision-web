import { Button, Dialog, DialogContent, Icon } from '@equinor/eds-core-react';
import { arrow_forward } from '@equinor/eds-icons';
import { useNavigate } from 'react-router';

export const InvalidDiagramDialog = () => {
	const navigate = useNavigate();

	const handleNavigateToInfluenceDiagram = () => {
		navigate(getInfluenceDiagramPath(window.location.pathname));
	};

	return (
		<Dialog
			open={true}
			data-no-dnd
			className='nodrag nopan nowheel fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform'
		>
			<DialogContent>
				<div className='flex flex-col gap-2'>
					<div className='flex flex-col gap-2 text-center'>
						<h2 className='text-2xl font-semibold'>Invalid influence diagram</h2>
						<p className='text-text-tertiary'>
							Your influence diagram is invalid. The decision tree cannot be
							calculated. Fix the errors in your influence diagram to continue.
						</p>
					</div>
					<div className='flex flex-col gap-2'>
						<Button variant='outlined' onClick={handleNavigateToInfluenceDiagram}>
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
	return currentPath.replace(
		/\/(decision-tree|solution-tree|compact-tree)$/,
		'/influence-diagram',
	);
};
