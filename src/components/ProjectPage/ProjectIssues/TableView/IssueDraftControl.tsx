import { Button, Icon } from '@equinor/eds-core-react/next';
import { add } from '@equinor/eds-icons';
import { Dispatch, SetStateAction } from 'react';
import { DecisionType, IssueType } from '../../../../validators';
import { IssueDraftCard } from '../../../common/Cards/IssueDraftCard';

export const IssueDraftControl = ({
	issueType,
	columnId = issueType,
	decisionType,
	isKey,
	position,
	activeDraft,
	setActiveDraft,
}: {
	issueType: BoardDraftLocation['type'];
	columnId?: string;
	decisionType?: DecisionType;
	isKey?: boolean;
	position: BoardDraftLocation['position'];
	activeDraft: BoardDraftLocation | null;
	setActiveDraft: Dispatch<SetStateAction<BoardDraftLocation | null>>;
}) => {
	if (activeDraft?.columnId === columnId && activeDraft.position === position) {
		return (
			<IssueDraftCard
				issueType={issueType}
				decisionType={decisionType}
				isKey={isKey}
				position={position}
				onClose={() =>
					setActiveDraft(current => (current === activeDraft ? null : current))
				}
			/>
		);
	}
	return (
		<Button
			variant='ghost'
			size='small'
			type='button'
			className='justify-start!'
			aria-label={`Add issue at ${position} of ${columnId}`}
			disabled={activeDraft !== null}
			onClick={() => setActiveDraft({ columnId, type: issueType, position })}
		>
			<Icon data={add} />
			Add issue
		</Button>
	);
};

export type BoardDraftLocation = {
	columnId: string;
	type: Exclude<IssueType, 'Utility'>;
	position: 'top' | 'bottom';
};
