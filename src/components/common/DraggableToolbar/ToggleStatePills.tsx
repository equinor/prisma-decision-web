import { Button, Icon, Tooltip } from '@equinor/eds-core-react';
import { visibility } from '@equinor/eds-icons';
import { useInfluenceDiagramStatePills } from '../../../hooks/useInfluenceDiagramStatePills';

export const ToggleStatePills = () => {
	const [showStatePills, setShowStatePills] = useInfluenceDiagramStatePills();

	return (
		<Button.Toggle
			onChange={() => setShowStatePills(current => !current)}
			selectedIndexes={showStatePills ? [0] : []}
		>
			<Tooltip title='Always show state pills'>
				<Button
					className='px-1.5!'
					aria-label='Always show state pills'
					aria-pressed={showStatePills}
				>
					<Icon data={visibility} />
				</Button>
			</Tooltip>
		</Button.Toggle>
	);
};
