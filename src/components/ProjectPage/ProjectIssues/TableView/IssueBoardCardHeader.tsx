import { ReactNode } from 'react';
import { Issue } from '../../../../validators';
import {
	BoundaryControl,
	DecisionTypeControl,
	IssueTypeControl,
	KeyControl,
} from '../ClassificationControls';
import { useIssueClassification } from '../useIssueClassification';

export const IssueBoardCardHeader = ({
	issue,
	children,
}: {
	issue: Issue;
	children?: ReactNode;
}) => {
	const { changeType, changeBoundary, changeDecisionType, toggleKey } =
		useIssueClassification(issue);

	return (
		<div className='flex items-center justify-between gap-1 py-1.5'>
			<div className='flex min-w-0 flex-1 flex-wrap items-center gap-1'>
				<IssueTypeControl issue={issue} onChange={changeType} />
				<BoundaryControl issue={issue} onChange={changeBoundary} />
				<DecisionTypeControl issue={issue} onChange={changeDecisionType} />
				<KeyControl issue={issue} onClick={toggleKey} />
			</div>
			{children}
		</div>
	);
};
