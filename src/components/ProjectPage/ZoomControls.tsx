import { Button, Icon } from '@equinor/eds-core-react';
import { zoom_in, zoom_out, fullscreen } from '@equinor/eds-icons';
import { useReactFlow } from '@xyflow/react';

export const ZoomControls = () => {
	const { zoomIn, zoomOut, fitView } = useReactFlow();
	return (
		<div className='flex gap-2'>
			<Button
				className='px-1.5!'
				title='Zoom in'
				aria-label='Zoom in'
				onClick={() => zoomIn()}
				variant='outlined'
			>
				<Icon data={zoom_in} />
			</Button>
			<Button
				className='px-1.5!'
				title='Zoom out'
				aria-label='Zoom out'
				onClick={() => zoomOut()}
				variant='outlined'
			>
				<Icon data={zoom_out} />
			</Button>
			<Button
				className='px-1.5!'
				title='Fit view'
				aria-label='Fit view'
				onClick={() => fitView()}
				variant='outlined'
			>
				<Icon data={fullscreen} />
			</Button>
		</div>
	);
};
