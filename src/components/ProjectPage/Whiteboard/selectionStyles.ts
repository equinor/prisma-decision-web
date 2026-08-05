import { CSSProperties } from 'react';

const whiteboardHandleBaseStyle = {
	width: 14,
	height: 14,
	borderRadius: 2,
	border: '2px solid var(--color-primary-resting)',
	backgroundColor: 'var(--color-background-default)',
} satisfies CSSProperties;

export const whiteboardNodeStrokeColor = 'var(--color-whiteboard-stroke)';
export const whiteboardPreviewStrokeColor = 'var(--color-whiteboard-stroke)';

export const whiteboardNodeResizerHandleStyle: CSSProperties = {
	pointerEvents: 'all',
	...whiteboardHandleBaseStyle,
};

export const whiteboardNodeResizerLineStyle: CSSProperties = {
	pointerEvents: 'all',
	borderColor: 'var(--color-primary-resting)',
};

export const whiteboardEndpointHandleStyle: CSSProperties = {
	pointerEvents: 'none',
	...whiteboardHandleBaseStyle,
};
