import { Icon } from '@equinor/eds-core-react/next';
import { bookmarks, checkbox_outline, label, radio_button_unselected } from '@equinor/eds-icons';
import { IssueType } from '../../validators';

const icons = {
	Unassigned: label,
	Decision: checkbox_outline,
	Uncertainty: radio_button_unselected,
	Fact: bookmarks,
};

export const IssueTypeIcon = ({ type }: { type: IssueType }) =>
	type === 'Utility' ? (
		<span
			aria-hidden
			className="size-5 shrink-0 bg-current mask-[url('/issue-utility.svg')] mask-center mask-no-repeat"
		/>
	) : (
		<Icon data={icons[type]} size='md' />
	);
