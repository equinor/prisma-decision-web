import { useReactFlow } from '@xyflow/react';
import { type WheelEvent as ReactWheelEvent } from 'react';

export const useWhiteboardWheelZoom = () => {
	const { getZoom, zoomTo } = useReactFlow();

	return (event: ReactWheelEvent<HTMLElement>) => {
		if (event.deltaY === 0) return;

		event.preventDefault();
		event.stopPropagation();

		if (event.deltaY < 0) {
			void zoomTo(getZoom() * 1.05);
			return;
		}

		void zoomTo(getZoom() * 0.95);
	};
};
