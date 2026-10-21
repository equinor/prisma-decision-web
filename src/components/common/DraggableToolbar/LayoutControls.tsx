import { Button, Label, Slider } from '@equinor/eds-core-react';
import { Icon } from '@equinor/eds-core-react/next';
import { tune } from '@equinor/eds-icons';
import { useInfluenceDiagramSettings } from '../../../hooks/useInfluenceDiagramSettings';
import { ToolbarPopoverButton } from './Toolbar';

export const LayoutControls = () => {
	const [layoutOptions, setLayoutOptions] = useInfluenceDiagramSettings();

	const updateLayoutDirection = (direction: 'DOWN' | 'RIGHT' | 'UP' | 'LEFT') => {
		setLayoutOptions(prev => ({
			...prev,
			'elk.direction': direction,
		}));
	};

	return (
		<ToolbarPopoverButton
			icon
			tooltip='Layout controls'
			trigger={<Icon data={tune} />}
			contentClassName='w-[min(300px,90vw)]'
		>
			<div className='flex flex-col gap-4'>
				<div>
					<Label label='Horizontal Spacing' className='ml-0!' />
					<Slider
						max={400}
						value={+layoutOptions['elk.layered.spacing.nodeNodeBetweenLayers']}
						onChangeCommitted={(_, value) =>
							setLayoutOptions(prev => ({
								...prev,
								'elk.layered.spacing.nodeNodeBetweenLayers': value[0].toString(),
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
		</ToolbarPopoverButton>
	);
};

const layoutDirections = [
	{ label: 'LR', value: 'RIGHT' },
	{ label: 'RL', value: 'LEFT' },
	{ label: 'TB', value: 'DOWN' },
	{ label: 'BT', value: 'UP' },
] as const;
