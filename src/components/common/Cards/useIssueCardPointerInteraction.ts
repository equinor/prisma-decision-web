import { DOMAttributes, useRef } from 'react';

// Idle actions are drag origins. Keep native click/keyboard activation, but discard
// the click following movement and do not enter a state editor on pointer focus.
export const useIssueCardPointerInteraction = (): DOMAttributes<HTMLDivElement> => {
	const press = useRef<{
		x: number;
		y: number;
		left: number;
		top: number;
		moved: boolean;
	} | null>(null);

	return {
		onPointerDownCapture: event => {
			if (event.button !== 0) return;
			if (!event.currentTarget.contains(event.target as Node)) return;
			const { left, top } = event.currentTarget.getBoundingClientRect();
			press.current = { x: event.clientX, y: event.clientY, left, top, moved: false };
		},
		onPointerMoveCapture: event => {
			if (!press.current) return;
			if (Math.hypot(event.clientX - press.current.x, event.clientY - press.current.y) > 5)
				press.current.moved = true;
		},
		onPointerCancelCapture: () => {
			press.current = null;
		},
		onMouseDownCapture: event => {
			if (
				event.button === 0 &&
				event.target instanceof Element &&
				event.target.closest('[data-card-action]')
			) {
				// Prevent mouse focus from activating state fields before release.
				// Pointer events still reach the drag sensor; inputs keep normal focus.
				event.preventDefault();
			}
		},
		onClickCapture: event => {
			const start = press.current;
			press.current = null;
			if (!start || event.detail === 0) return;
			const { left, top } = event.currentTarget.getBoundingClientRect();
			if (
				start.moved ||
				Math.hypot(event.clientX - start.x, event.clientY - start.y) > 5 ||
				Math.hypot(left - start.left, top - start.top) > 0.5
			) {
				event.preventDefault();
				event.stopPropagation();
			}
		},
	};
};
