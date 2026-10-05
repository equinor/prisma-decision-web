import { Button, Icon } from '@equinor/eds-core-react';
import { pan_tool } from '@equinor/eds-icons';

export const TogglePanMode = ({ checked, onChange }: TogglePanModeProps) => {
	return (
		<Button.Toggle
			onChange={onChange}
			selectedIndexes={checked ? [0] : []}
			title='Toggle pan mode'
		>
			<Button className='px-1.5!' title='Pan mode' aria-label='Pan mode'>
				<Icon data={pan_tool} />
			</Button>
		</Button.Toggle>
	);
};

type TogglePanModeProps = {
	checked: boolean;
	onChange: () => void;
};
