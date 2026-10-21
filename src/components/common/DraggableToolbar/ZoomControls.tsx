import { Icon } from '@equinor/eds-core-react/next';
import { zoom_in, zoom_out, fullscreen } from '@equinor/eds-icons';
import { useReactFlow } from '@xyflow/react';
import { ToolbarButton, ToolbarGroup } from './Toolbar';

export const ZoomControls = () => {
	const { zoomIn, zoomOut, fitView } = useReactFlow();
	return (
		<ToolbarGroup aria-label='Viewport controls'>
			<ToolbarButton icon tooltip='Zoom in' onClick={() => zoomIn()}>
				<Icon data={zoom_in} />
			</ToolbarButton>
			<ToolbarButton icon tooltip='Zoom out' onClick={() => zoomOut()}>
				<Icon data={zoom_out} />
			</ToolbarButton>
			<ToolbarButton icon tooltip='Fit view' onClick={() => fitView()}>
				<Icon data={fullscreen} />
			</ToolbarButton>
		</ToolbarGroup>
	);
};
