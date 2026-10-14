import { Button, Icon, Tooltip } from '@equinor/eds-core-react';
import { pan_tool } from '@equinor/eds-icons';

export const TogglePanMode = ({ checked, onChange }: TogglePanModeProps) => {
	return (
		<Button.Toggle
			onChange={onChange}
			selectedIndexes={checked ? [0] : []}
		>
			<Tooltip title='Pan mode'>
				<Button className='px-1.5!' aria-label='Pan mode'>
					<Icon data={pan_tool} />
				</Button>
			</Tooltip>
		</Button.Toggle>
	);
};

type TogglePanModeProps = {
	checked: boolean;
	onChange: () => void;
};
