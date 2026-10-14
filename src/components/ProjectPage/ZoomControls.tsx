import { Button, Icon, Tooltip } from '@equinor/eds-core-react';
import { zoom_in, zoom_out, fullscreen } from '@equinor/eds-icons';
import { useReactFlow } from '@xyflow/react';

export const ZoomControls = () => {
	const { zoomIn, zoomOut, fitView } = useReactFlow();
	return (
		<div className='flex gap-2'>
			<Tooltip title='Zoom in'>
				<Button
					className='px-1.5!'
					aria-label='Zoom in'
					onClick={() => zoomIn()}
					variant='outlined'
				>
					<Icon data={zoom_in} />
				</Button>
			</Tooltip>
			<Tooltip title='Zoom out'>
				<Button
					className='px-1.5!'
					aria-label='Zoom out'
					onClick={() => zoomOut()}
					variant='outlined'
				>
					<Icon data={zoom_out} />
				</Button>
			</Tooltip>
			<Tooltip title='Fit view'>
				<Button
					className='px-1.5!'
					aria-label='Fit view'
					onClick={() => fitView()}
					variant='outlined'
				>
					<Icon data={fullscreen} />
				</Button>
			</Tooltip>
		</div>
	);
};
