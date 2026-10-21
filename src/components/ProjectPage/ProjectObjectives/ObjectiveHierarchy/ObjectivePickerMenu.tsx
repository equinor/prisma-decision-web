import { Menu } from '@equinor/eds-core-react';
import { ComponentProps } from 'react';
import { Objective } from '../../../../validators';
import { ObjectiveTypeBadge } from './ObjectiveTypeBadge';

type ObjectivePickerMenuProps = {
	anchorEl: HTMLElement | null;
	title: string;
	options: Objective[];
	placement?: ComponentProps<typeof Menu>['placement'];
	onPick: (objectiveId: string) => void;
	onClose: () => void;
};

export const ObjectivePickerMenu = ({
	anchorEl,
	title,
	options,
	placement = 'right-start',
	onPick,
	onClose,
}: ObjectivePickerMenuProps) => (
	// React portals bubble clicks to the card, which would toggle it
	<div className='contents' onClick={event => event.stopPropagation()}>
		<Menu open anchorEl={anchorEl} onClose={onClose} placement={placement}>
			<Menu.Section title={title}>
				{options.length === 0 ? (
					<Menu.Item disabled>No available objectives</Menu.Item>
				) : (
					options.map(option => (
						<Menu.Item
							key={option.id}
							onClick={() => {
								onPick(option.id);
								onClose();
							}}
						>
							<ObjectiveTypeBadge type={option.type} />
							<p>{option.name}</p>
						</Menu.Item>
					))
				)}
			</Menu.Section>
		</Menu>
	</div>
);
