import { Button, Icon, Label, Popover, Slider } from '@equinor/eds-core-react';
import { useRef, useState } from 'react';
import { useInfluenceDiagramSettings } from '../../../../hooks/useInfluenceDiagramSettings';
import { settingsPanelIcon } from '../../../../icons';

export const LayoutControls = () => {
	const [layoutOptions, setLayoutOptions] = useInfluenceDiagramSettings();
	const referenceElement = useRef<HTMLButtonElement>(null);
	const [isOpen, setIsOpen] = useState(false);

	const updateLayoutDirection = (direction: 'DOWN' | 'RIGHT' | 'UP' | 'LEFT') => {
		setLayoutOptions(prev => ({
			...prev,
			'elk.direction': direction,
		}));
	};

	return (
		<>
			<Button
				ref={referenceElement}
				className='px-1.5!'
				variant='outlined'
				onClick={() => setIsOpen(prev => !prev)}
			>
				<Icon data={settingsPanelIcon} />
			</Button>
			<Popover
				open={isOpen}
				anchorEl={referenceElement.current}
				onClose={() => setIsOpen(false)}
			>
				<Popover.Content className='relative w-[min(300px,90vw)] '>
					<div className='flex flex-col gap-4'>
						<div>
							<Label label='Horizontal Spacing' className='ml-0!' />
							<Slider
								max={400}
								value={+layoutOptions['elk.layered.spacing.nodeNodeBetweenLayers']}
								onChangeCommitted={(_, value) =>
									setLayoutOptions(prev => ({
										...prev,
										'elk.layered.spacing.nodeNodeBetweenLayers':
											value[0].toString(),
										'elk.layered.spacing.edgeNodeBetweenLayers': (
											value[0] / 2
										).toString(),
									}))
								}
							/>
						</div>

						<div className='mb-3'>
							<Label label='Vertical Spacing' className='ml-0!' />
							<Slider
								max={400}
								value={+layoutOptions['elk.spacing.nodeNode']}
								onChangeCommitted={(_, value) =>
									setLayoutOptions(prev => ({
										...prev,
										'elk.spacing.nodeNode': value.toString(),
									}))
								}
							/>
						</div>
						<div>
							<Label label='Layout Direction' className='mb-1! ml-0!' />
							<Button.Toggle
								selectedIndexes={[
									layoutDirections.findIndex(
										x => layoutOptions['elk.direction'] === x.value,
									),
								]}
							>
								{layoutDirections.map(direction => (
									<Button
										key={direction.value}
										onClick={() => updateLayoutDirection(direction.value)}
									>
										{direction.label}
									</Button>
								))}
							</Button.Toggle>
						</div>
					</div>
				</Popover.Content>
			</Popover>
		</>
	);
};

const layoutDirections = [
	{ label: 'LR', value: 'RIGHT' },
	{ label: 'RL', value: 'LEFT' },
	{ label: 'TB', value: 'DOWN' },
	{ label: 'BT', value: 'UP' },
] as const;
