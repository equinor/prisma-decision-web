import { Button, Icon } from '@equinor/eds-core-react/next';
import { add } from '@equinor/eds-icons';
import { BoardIssueComposer } from './BoardIssueComposer';
import { BoardComposerLocation, useBoardQuickCreation } from './useBoardQuickCreation';

export const BoardQuickAdd = ({
	issueType,
	position,
	creation,
}: {
	issueType: BoardComposerLocation['type'];
	position: BoardComposerLocation['position'];
	creation: ReturnType<typeof useBoardQuickCreation>;
}) => {
	if (creation.composer?.type === issueType && creation.composer.position === position) {
		return (
			<BoardIssueComposer
				issueType={issueType}
				position={position}
				onClose={creation.close}
				onCreated={id => creation.created(id, creation.composer)}
			/>
		);
	}
	return (
		<Button
			variant='ghost'
			size='small'
			type='button'
			className='justify-start!'
			aria-label={`Add issue at ${position} of ${issueType}`}
			disabled={creation.composer !== null}
			onClick={() => creation.open({ type: issueType, position })}
		>
			<Icon data={add} />
			Add issue
		</Button>
	);
};
