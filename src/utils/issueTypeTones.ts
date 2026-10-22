import { ChipTone } from '@equinor/eds-core-react/next';
import { IssueType } from '../validators';

export const issueTypeTones: Record<IssueType, ChipTone> = {
	Unassigned: 'danger',
	Decision: 'warning',
	Uncertainty: 'success',
	Fact: 'neutral',
	Utility: 'info',
};
