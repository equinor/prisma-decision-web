import { Button, Icon, Tooltip } from '@equinor/eds-core-react';
import { category, credit_card } from '@equinor/eds-icons';
import { useInfluenceDiagramNodeView } from '../../../../hooks/useInfluenceDiagramNodeView';

export const ToggleNodeView = () => {
	const [nodeView, setNodeView] = useInfluenceDiagramNodeView();

	return (
		<Button.Toggle
			className='toolbar-mode-switch'
			aria-label='Diagram view'
			selectedIndexes={[nodeView === 'card' ? 0 : 1]}
		>
			<Tooltip title='Card view'>
				<Button aria-label='Card view' onClick={() => setNodeView('card')}>
					<Icon data={credit_card} />
				</Button>
			</Tooltip>
			<Tooltip title='Shape view'>
				<Button aria-label='Shape view' onClick={() => setNodeView('shape')}>
					<Icon data={category} />
				</Button>
			</Tooltip>
		</Button.Toggle>
	);
};
