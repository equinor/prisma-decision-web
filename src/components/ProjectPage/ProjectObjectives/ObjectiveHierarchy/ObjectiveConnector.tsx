import { PointerEvent, useRef, useState } from 'react';
import { cn } from '../../../../utils/cn';
import { Objective } from '../../../../validators';
import { ConnectorGlyph, ConnectorSide } from '../../../common/ConnectorGlyph';
import { ObjectivePickerMenu } from './ObjectivePickerMenu';

// 'child' links to a supporting objective, 'parent' to one it contributes to
export type ConnectorDirection = 'child' | 'parent';

const sideClasses: Record<ConnectorSide, string> = {
	right: 'left-full h-11.5 w-12 -translate-y-1/2 items-center justify-start pl-2',
	left: 'right-full h-11.5 w-12 -translate-y-1/2 items-center justify-end pr-2',
	bottom: 'top-full left-1/2 h-12 w-11.5 -translate-x-1/2 flex-col items-center justify-start pt-2',
	top: 'bottom-full left-1/2 h-12 w-11.5 -translate-x-1/2 flex-col items-center justify-end pb-2',
};

const menuPlacement = {
	right: 'right-start',
	left: 'left-start',
	bottom: 'bottom',
	top: 'top',
} as const;

type ObjectiveConnectorProps = {
	objective: Objective;
	direction: ConnectorDirection;
	side: ConnectorSide;
	// Vertical position for left/right connectors (defaults to the card's middle)
	topClassName?: string;
	active: boolean;
	hidden: boolean;
	options: Objective[];
	onPointerDown: (event: PointerEvent, openMenu: () => void) => void;
	onPick: (objectiveId: string) => void;
};

// Hover handle beside a card: drag onto a card on the neighbouring level, or click to pick one
export const ObjectiveConnector = ({
	objective,
	direction,
	side,
	topClassName = 'top-1/2',
	active,
	hidden,
	options,
	onPointerDown,
	onPick,
}: ObjectiveConnectorProps) => {
	const ref = useRef<HTMLButtonElement>(null);
	const [menuOpen, setMenuOpen] = useState(false);
	const isChild = direction === 'child';

	return (
		<>
			<button
				ref={ref}
				type='button'
				aria-label={
					isChild
						? `Link ${objective.name} to a supporting objective`
						: `Link ${objective.name} to an objective it contributes to`
				}
				className={cn(
					'group/connector absolute flex cursor-pointer touch-none',
					sideClasses[side],
					(side === 'left' || side === 'right') && topClassName,
					{ 'pointer-events-none opacity-0': hidden },
				)}
				onPointerDown={event => onPointerDown(event, () => setMenuOpen(true))}
				onClick={event => event.stopPropagation()}
			>
				<ConnectorGlyph open={menuOpen || active} side={side} />
			</button>
			{menuOpen && (
				<ObjectivePickerMenu
					anchorEl={ref.current}
					title={isChild ? 'Supported by' : 'Contributes to'}
					options={options}
					placement={menuPlacement[side]}
					onPick={onPick}
					onClose={() => setMenuOpen(false)}
				/>
			)}
		</>
	);
};
