import { Icon } from '@equinor/eds-core-react';
import { bookmarks, check_circle_outlined, inbox, info_circle } from '@equinor/eds-icons';
import { utilityIcon } from '../../../icons';
import { IssueType } from '../../../validators';

export const IssueTypeLabel = ({ type }: { type: IssueType }) => {
	switch (type) {
		case 'Decision':
			return <DecisionLabel />;
		case 'Unassigned':
			return <UnassignedLabel />;
		case 'Uncertainty':
			return <UncertaintyLabel />;
		case 'Fact':
			return <FactLabel />;
		case 'Utility':
			return <UtilityLabel />;
	}
};

export const DecisionLabel = () => {
	return (
		<div
			className='flex items-center justify-center gap-1 rounded-xl
            bg-[#FFF7D0] px-2 text-center text-xs leading-4 font-medium text-[#585858]'
		>
			<Icon className='min-h-6' data={check_circle_outlined} size={16} />
			<p className='pt-0.5'>Decision</p>
		</div>
	);
};

export const UnassignedLabel = () => {
	return (
		<div
			className='flex items-center justify-center gap-1 rounded-xl
            bg-[#FFE8E8] px-2 text-center text-xs leading-4 font-medium text-[#585858]'
		>
			<Icon className='min-h-6' data={inbox} size={16} />
			<p className='pt-0.5'>Unassigned</p>
		</div>
	);
};

export const UncertaintyLabel = () => {
	return (
		<div
			className='flex items-center justify-center gap-1 rounded-xl
            bg-[#E1FCEA] px-2 text-center text-xs leading-4 font-medium text-[#585858]'
		>
			<Icon className='min-h-6' data={info_circle} size={16} />
			<p className='pt-0.5'>Uncertainty</p>
		</div>
	);
};

export const FactLabel = () => {
	return (
		<div
			className='flex items-center justify-center gap-1 rounded-xl
            bg-[#FBDAC1] px-2 text-center text-xs leading-4 font-medium text-[#585858]'
		>
			<Icon className='min-h-6' data={bookmarks} size={16} />
			<p className='pt-0.5'>Fact</p>
		</div>
	);
};

export const UtilityLabel = () => {
	return (
		<div
			className='flex items-center justify-center gap-1 rounded-xl
            bg-[#CAE6FA] px-2 text-center text-xs leading-4 font-medium text-[#585858]'
		>
			<Icon className='min-h-6' data={utilityIcon} size={16} />
			<p className='pt-0.5'>Utility</p>
		</div>
	);
};
