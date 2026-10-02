import { Button, Icon } from '@equinor/eds-core-react';
import { radio_button_selected, radio_button_unselected } from '@equinor/eds-icons';

export type ForceState = {
	selectedId?: string;
	isDisabled: (stateId: string) => boolean;
	onToggle: (stateId: string) => void;
};

export const ForceStateButton = ({
	forceState,
	stateId,
	label,
}: {
	forceState: ForceState;
	stateId: string | undefined;
	label: string;
}) => {
	const selected = !!stateId && forceState.selectedId === stateId;
	return (
		<Button
			variant='ghost_icon'
			className='mt-3.5 self-start'
			aria-pressed={selected}
			disabled={!stateId || forceState.isDisabled(stateId)}
			title={selected ? `Clear forced ${label}` : `Force this ${label}`}
			onClick={() => stateId && forceState.onToggle(stateId)}
		>
			<Icon data={selected ? radio_button_selected : radio_button_unselected} />
		</Button>
	);
};
