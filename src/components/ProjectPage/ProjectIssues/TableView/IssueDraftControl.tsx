import { Button, Icon } from '@equinor/eds-core-react/next';
import { add } from '@equinor/eds-icons';
import { Dispatch, SetStateAction } from 'react';
import { IssueType } from '../../../../validators';
import { IssueDraftCard } from '../../../common/Cards/IssueDraftCard';

export const IssueDraftControl = ({
	issueType,
	position,
	activeDraft,
	setActiveDraft,
}: {
	issueType: BoardDraftLocation['type'];
	position: BoardDraftLocation['position'];
	activeDraft: BoardDraftLocation | null;
	setActiveDraft: Dispatch<SetStateAction<BoardDraftLocation | null>>;
}) => {
	if (activeDraft?.type === issueType && activeDraft.position === position) {
		return (
			<IssueDraftCard
				issueType={issueType}
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
			aria-label={`Add issue at ${position} of ${issueType}`}
			disabled={activeDraft !== null}
			onClick={() => setActiveDraft({ type: issueType, position })}
		>
			<Icon data={add} />
			Add issue
		</Button>
	);
};

export type BoardDraftLocation = {
	type: Exclude<IssueType, 'Utility'>;
	position: 'top' | 'bottom';
};
