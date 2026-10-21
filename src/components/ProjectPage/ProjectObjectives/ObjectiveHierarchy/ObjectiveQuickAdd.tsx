import { Button, Icon } from '@equinor/eds-core-react';
import { add } from '@equinor/eds-icons';
import { cn } from '../../../../utils/cn';
import { ObjectiveType } from '../../../../validators';
import { ComposerPosition, ObjectiveComposer } from './ObjectiveComposer';

export type ComposerLocation = { type: ObjectiveType; position: ComposerPosition };

export const ObjectiveQuickAdd = ({
	type,
	label,
	position,
	composer,
	onOpen,
	onClose,
	onCreated,
}: {
	type: ObjectiveType;
	label: string;
	position: ComposerPosition;
	composer: ComposerLocation | null;
	onOpen: (location: ComposerLocation) => void;
	onClose: () => void;
	onCreated: (id: string) => void;
}) => {
	const open = composer?.type === type && composer.position === position;
	return (
		// The composer floats over the cards so the layout doesn't shift while typing
		<div className='relative w-full'>
			<Button
				variant='ghost'
				type='button'
				className={cn('relative z-20 h-8! w-max text-xs!', { invisible: open })}
				aria-label={`Add ${label.toLowerCase()} objective at ${position}`}
				disabled={composer !== null}
				onClick={event => {
					event.stopPropagation();
					onOpen({ type, position });
				}}
			>
				<Icon data={add} size={16} />
				Add objective
			</Button>
			{open && (
				<div className='absolute inset-x-0 top-0 z-40'>
					<ObjectiveComposer
						type={type}
						label={label}
						position={position}
						onClose={onClose}
						onCreated={onCreated}
					/>
				</div>
			)}
		</div>
	);
};
