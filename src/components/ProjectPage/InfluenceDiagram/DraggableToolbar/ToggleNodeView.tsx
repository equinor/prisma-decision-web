import { Button, Icon } from '@equinor/eds-core-react';
import { category, view_agenda } from '@equinor/eds-icons';
import { useInfluenceDiagramNodeView } from '../../../../hooks/useInfluenceDiagramNodeView';

export const ToggleNodeView = () => {
	const [nodeView, setNodeView] = useInfluenceDiagramNodeView();

	return (
		<Button.Toggle selectedIndexes={[nodeView === 'card' ? 0 : 1]}>
			<Button className='px-1.5!' title='Card view' onClick={() => setNodeView('card')}>
				<Icon data={view_agenda} />
			</Button>
			<Button className='px-1.5!' title='Shape view' onClick={() => setNodeView('shape')}>
				<Icon data={category} />
			</Button>
		</Button.Toggle>
	);
};
