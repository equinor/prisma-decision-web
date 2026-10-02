import { Icon } from '@equinor/eds-core-react';
import { chevron_down } from '@equinor/eds-icons';
import { NodeToolbar, Position } from '@xyflow/react';
import { useEffect, useRef, useState } from 'react';
import { useInfluenceDiagramEvidence } from '../../../hooks/useInfluenceDiagramEvidence';
import { useSelectedProjectRestrictionTables } from '../../../hooks/useSelectedProjectRestrictionTables';
import { cn } from '../../../utils/cn';
import { sortByCreatedAt } from '../../../utils/sortByCreatedAt';
import { Issue, Option, Outcome } from '../../../validators';

// States chip below a shape node; opens a popover for picking evidence (scenario EV).
export const InfluenceShapeStates = ({ issue }: { issue: Issue }) => {
	const [open, setOpen] = useState(false);
	const triggerRef = useRef<HTMLButtonElement>(null);
	const popoverRef = useRef<HTMLDivElement>(null);
	const { evidence, toggleEvidence } = useInfluenceDiagramEvidence();
	const { fullyRestrictedStateIds } = useSelectedProjectRestrictionTables();

	useEffect(() => {
		if (!open) return;
		const onPointerDown = (event: PointerEvent) => {
			const target = event.target as Node;
			if (triggerRef.current?.contains(target) || popoverRef.current?.contains(target)) {
				return;
			}
			setOpen(false);
		};
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') setOpen(false);
		};
		document.addEventListener('pointerdown', onPointerDown, true);
		document.addEventListener('keydown', onKeyDown);
		return () => {
			document.removeEventListener('pointerdown', onPointerDown, true);
			document.removeEventListener('keydown', onKeyDown);
		};
	}, [open]);

	const states: (Option | Outcome)[] =
		issue.type === 'Uncertainty'
			? sortByCreatedAt(issue.uncertainty.outcomes)
			: sortByCreatedAt(issue.decision.options);
	if (states.length === 0) return null;
	const selectedState = states.find(state => evidence.includes(state.id));

	return (
		<>
			<button
				ref={triggerRef}
				type='button'
				onClick={event => {
					event.stopPropagation();
					setOpen(prev => !prev);
				}}
				className={cn(
					`nodrag nopan bg-background-default absolute top-[calc(100%-3px)] left-1/2 z-10
					flex max-w-40 -translate-x-1/2 cursor-pointer items-center gap-0.5 rounded-xl
					border py-0.5 pr-1 pl-2 text-xs leading-4 font-medium whitespace-nowrap
					shadow-[0px_3px_4px_rgba(0,0,0,0.06)]`,
					selectedState
						? 'border-primary-resting text-primary-resting border-2 py-px'
						: 'border-background-medium text-text-tertiary',
				)}
			>
				<span className='truncate'>
					{selectedState ? selectedState.name : `${states.length} states`}
				</span>
				<Icon
					data={chevron_down}
					size={18}
					className={selectedState ? 'fill-primary-resting' : 'fill-text-tertiary'}
				/>
			</button>
			<NodeToolbar
				isVisible={open}
				position={Position.Bottom}
				offset={-3}
				style={{ zIndex: 1003 }}
			>
				<div
					ref={popoverRef}
					// React portals bubble clicks to the node, which would open the side sheet
					onClick={event => event.stopPropagation()}
					className='nodrag nopan nowheel bg-background-default shadow-tile pointer-events-auto w-60
						rounded-sm px-2 pt-3 pb-1'
				>
					<ul className='flex flex-col gap-2 text-sm'>
						{states.map(state => {
							const isSelected = state.id === selectedState?.id;
							const disabled =
								fullyRestrictedStateIds.includes(state.id) && !isSelected;
							return (
								<li
									key={state.id}
									onClick={() => {
										if (disabled) return;
										toggleEvidence(state.id, issue.id);
										setOpen(false);
									}}
									className={cn(
										'bg-background-light flex justify-between gap-2 rounded-sm px-2 py-1',
										{
											'hover:bg-primary-hover-alt cursor-pointer': !disabled,
											'cursor-not-allowed opacity-50': disabled,
											'outline-primary-resting outline-2 -outline-offset-2':
												isSelected,
										},
									)}
								>
									<p className='truncate'>{state.name}</p>
									<p className='truncate'>{state.utility}</p>
								</li>
							);
						})}
					</ul>
				</div>
			</NodeToolbar>
		</>
	);
};
