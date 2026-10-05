import { Button, Icon } from '@equinor/eds-core-react';
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
			<Button title='Card view' aria-label='Card view' onClick={() => setNodeView('card')}>
				<Icon data={credit_card} />
			</Button>
			<Button title='Shape view' aria-label='Shape view' onClick={() => setNodeView('shape')}>
				<Icon data={category} />
			</Button>
		</Button.Toggle>
	);
};
