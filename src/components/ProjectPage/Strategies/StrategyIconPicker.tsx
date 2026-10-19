import { Button, Icon, Popover, Tooltip } from '@equinor/eds-core-react';
import { useRef, useState } from 'react';
import { useController, useFormContext, useWatch } from 'react-hook-form';
import { Strategy } from '../../../validators';
import { strategyIconKeys, strategyIcons } from './icons';
import { useSelectedProjectStrategies } from '../../../hooks/useSelectedProjectStrategies';
import { cn } from '../../../utils/cn';

export const StrategyIconPicker = ({ className }: { className?: string }) => {
	const referenceElement = useRef<HTMLButtonElement>(null);
	const [isOpen, setIsOpen] = useState(false);
	const { selectedStrategies } = useSelectedProjectStrategies();
	const { control } = useFormContext<Strategy>();
	const iconColor = useWatch({
		control,
		name: 'icon_color',
	});
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
					aria-label='Strategy icon'
					onClick={() => setIsOpen(prev => !prev)}
					variant='outlined'
					className={cn('mt-4! size-9!', className)}
				>
					<Icon data={strategyIcons[icon]} color={iconColor} />
				</Button>
			</Tooltip>
			<Popover
				open={isOpen}
				onClose={() => setIsOpen(false)}
				anchorEl={referenceElement.current}
			>
				<Popover.Content>
					<div className='grid grid-cols-4 gap-2'>
						{strategyIconKeys
							.filter(
								iconKey =>
									!selectedStrategies.some(strategy => strategy.icon === iconKey),
							)
							.map(iconKey => (
								<Button
									key={iconKey}
									aria-label={`Use ${iconKey} icon`}
									variant='ghost'
									className='size-10!'
									onClick={() => {
										onChange(iconKey);
										setIsOpen(false);
									}}
								>
									<Icon color={iconColor} data={strategyIcons[iconKey]} />
								</Button>
							))}
					</div>
				</Popover.Content>
			</Popover>
		</>
	);
};
