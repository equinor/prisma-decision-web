import { Button, Icon } from '@equinor/eds-core-react';
import { select_all } from '@equinor/eds-icons';

export const ToggleSelectionMode = ({ checked, onChange }: ToggleSelectionModeProps) => {
	return (
		<Button.Toggle
			onChange={onChange}
			selectedIndexes={checked ? [0] : []}
			title='Toggle selection mode'
		>
			<Button className='px-1.5!' title='Selection mode' aria-label='Selection mode'>
				<Icon data={select_all} />
			</Button>
		</Button.Toggle>
	);
};

type ToggleSelectionModeProps = {
	checked: boolean;
	onChange: () => void;
};
