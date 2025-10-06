import { Chip } from '@equinor/eds-core-react';
import { Issue } from '../../../validators';

import { CardContainer } from './CardContainer';
import { DeleteIssueDialog } from '../../ProjectPage/DeleteIssueDialog';
import { EditIssueModal } from '../../ProjectPage/EditIssueModal';

export const UnassignedCard = ({ issue, ...rest }: UnassignedCardProps) => {
	return (
		<CardContainer {...rest}>
			<div className='flex items-center justify-between'>
				<div className='flex gap-2'>
					<Chip>Unassigned</Chip>
					<Chip className='capitalize'>{issue.boundary}</Chip>
				</div>
				<div>
					<EditIssueModal issue={issue} />
					<DeleteIssueDialog issue={issue} />
				</div>
			</div>
			<h3 className='font-semibold '>{issue.name}</h3>
			<p className='text-text-tertiary overflow-hidden text-sm'>{issue.description}</p>
		</CardContainer>
	);
};

type UnassignedCardProps = {
	issue: Issue;
	className?: string;
};
