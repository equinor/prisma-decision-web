import { Button, Icon, Tooltip } from '@equinor/eds-core-react';
import { select_all } from '@equinor/eds-icons';

export const ToggleSelectionMode = ({ checked, onChange }: ToggleSelectionModeProps) => {
	return (
		<Button.Toggle
			onChange={onChange}
			selectedIndexes={checked ? [0] : []}
		>
			<Tooltip title='Selection mode'>
				<Button className='px-1.5!' aria-label='Selection mode'>
					<Icon data={select_all} />
				</Button>
			</Tooltip>
		</Button.Toggle>
	);
};

type ToggleSelectionModeProps = {
	checked: boolean;
	onChange: () => void;
};
