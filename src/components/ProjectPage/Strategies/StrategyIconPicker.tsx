import { Button, Icon, Popover, Tooltip } from '@equinor/eds-core-react';
import { useRef, useState } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { Strategy } from '../../../validators';
import { strategyIconKeys, strategyIcons } from './icons';

export const StrategyIconPicker = () => {
	const referenceElement = useRef<HTMLButtonElement>(null);
	const [isOpen, setIsOpen] = useState(false);
	const { control } = useFormContext<Strategy>();
	const {
		field: { value: icon, onChange },
	} = useController({
		name: 'icon',
		control,
	});
	return (
		<>
			<Tooltip title='Select strategy icon'>
				<Button
					ref={referenceElement}
					onClick={() => setIsOpen(prev => !prev)}
					variant='outlined'
					className='mt-4! size-9!'
				>
					<Icon data={strategyIcons[icon]} />
				</Button>
			</Tooltip>
			<Popover
				open={isOpen}
				onClose={() => setIsOpen(false)}
				anchorEl={referenceElement.current}
			>
				<Popover.Content>
					<div className='grid grid-cols-4 gap-2'>
						{strategyIconKeys.map(iconKey => (
							<Button
								key={iconKey}
								variant='ghost'
								className='size-10!'
								onClick={() => {
									onChange(iconKey);
									setIsOpen(false);
								}}
							>
								<Icon data={strategyIcons[iconKey]} />
							</Button>
						))}
					</div>
				</Popover.Content>
			</Popover>
		</>
	);
};
