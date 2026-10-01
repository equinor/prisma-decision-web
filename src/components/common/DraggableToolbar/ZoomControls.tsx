import { Button, Icon } from '@equinor/eds-core-react';
import { zoom_in, zoom_out, fullscreen } from '@equinor/eds-icons';
import { useReactFlow } from '@xyflow/react';

export const ZoomControls = () => {
	const { zoomIn, zoomOut, fitView } = useReactFlow();
	return (
		<div className='flex gap-1'>
			<Button className='px-1.5!' onClick={() => zoomIn()} variant='ghost'>
				<Icon data={zoom_in} />
			</Button>
			<Button className='px-1.5!' onClick={() => zoomOut()} variant='ghost'>
				<Icon data={zoom_out} />
			</Button>
			<Button className='px-1.5!' onClick={() => fitView()} variant='ghost'>
				<Icon data={fullscreen} />
			</Button>
		</div>
	);
};
