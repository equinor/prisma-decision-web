import { Button, Icon, Tooltip } from '@equinor/eds-core-react';
import { cut } from '@equinor/eds-icons';
import { Handle, Position } from '@xyflow/react';

export const PrunedNode = () => (
	<div className='flex h-full items-center'>
		<Handle
			type='target'
			position={Position.Left}
			id='left'
			className='bg-primary-resting! z-1 h-3! w-3! opacity-0'
		/>
		<Tooltip title='Pruned branch' placement='top'>
			<Button
				aria-label='Pruned branch'
				variant='outlined'
				className='pointer-events-none size-12! border-0! outline-2!'
				style={{ outlineStyle: 'dashed' }}
			>
				<Icon data={cut} />
			</Button>
		</Tooltip>
	</div>
);
