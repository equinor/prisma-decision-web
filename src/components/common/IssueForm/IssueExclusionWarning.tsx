import { Banner, Icon } from '@equinor/eds-core-react/next';
import { warning_outlined } from '@equinor/eds-icons';
import { ReactNode } from 'react';
import { useWatch } from 'react-hook-form';
import { useIssueFormContext } from '../../../hooks/useIssueForm';
import { isIssueInInfluenceDiagram } from '../../../utils/isIssueInInfluenceDiagram';
import { Issue } from '../../../validators';

export const IssueBoundaryWarning = ({ issue }: { issue: Issue }) => {
	const { control } = useIssueFormContext();
	const boundary = useWatch({ control, name: 'boundary' });
	if (!isIssueInInfluenceDiagram(issue) || boundary !== 'out') return null;
	return (
		<Warning>
			Issues outside the boundary aren’t shown in the influence diagram. Updating will remove
			this node.
		</Warning>
	);
};

export const IssueTypeWarning = ({ issue }: { issue: Issue }) => {
	const { control } = useIssueFormContext();
	const [type, decisionType, isKey] = useWatch({
		control,
		name: ['type', 'decision.type', 'uncertainty.is_key'],
	});
	if (!isIssueInInfluenceDiagram(issue)) return null;
	if (type === 'Decision' && decisionType !== 'Focus')
		return (
			<Warning>
				Only Focus decisions are shown in the influence diagram. Updating will remove this
				node.
			</Warning>
		);
	if (type === 'Uncertainty' && !isKey)
		return (
			<Warning>
				Only key uncertainties are shown in the influence diagram. Updating will remove this
				node.
			</Warning>
		);
	return null;
};

const Warning = ({ children }: { children: ReactNode }) => (
	<Banner tone='warning' className='rounded-sm border! px-3! py-2!'>
		<Banner.Icon>
			<Icon data={warning_outlined} />
		</Banner.Icon>
		<Banner.Message>{children}</Banner.Message>
	</Banner>
);
