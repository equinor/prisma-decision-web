import { Button, Icon, Tooltip } from '@equinor/eds-core-react';
import { restore } from '@equinor/eds-icons';
import { useNodes } from '@xyflow/react';
import { useInfluenceDiagramCustomPositions } from '../../../../hooks/useInfluenceDiagramCustomPositions';

export const ResetLayout = () => {
	const [customPositions, setCustomPositions] = useInfluenceDiagramCustomPositions();
	const nodes = useNodes();
	const hasCustomPositions = nodes.some(node => node.id in customPositions);

	return (
		<Tooltip title='Reset to automatic layout'>
			<Button
				className='px-1.5!'
				variant='outlined'
				disabled={!hasCustomPositions}
				onClick={() => setCustomPositions({})}
			>
				<Icon data={restore} />
			</Button>
		</Tooltip>
	);
};
