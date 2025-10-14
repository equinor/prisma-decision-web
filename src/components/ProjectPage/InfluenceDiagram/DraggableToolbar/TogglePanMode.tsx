import { Button } from '@equinor/eds-core-react';
import { DragIcon } from '../../../common/DragIcon';

export const TogglePanMode = ({ checked, onChange }: TogglePanModeProps) => {
	return (
		<Button.Toggle
			onChange={onChange}
			selectedIndexes={checked ? [0] : []}
			title='Toggle pan mode'
		>
			<Button className='px-1.5!'>
				<DragIcon />
			</Button>
		</Button.Toggle>
	);
};

type TogglePanModeProps = {
	checked: boolean;
	onChange: () => void;
};
