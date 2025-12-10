import { Icon } from '@equinor/eds-core-react';
import { check_circle_outlined, inbox, info_circle } from '@equinor/eds-icons';

export const DecisionLabel = () => {
	return (
		<div
			className='flex items-center justify-center gap-1 rounded-xl
            bg-[#FFF7D0] px-2 text-center text-xs leading-4 font-medium text-[#585858]'
		>
			<Icon data={check_circle_outlined} size={16} />
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
			<Icon data={inbox} size={16} />
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
			<Icon data={info_circle} size={16} />
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
			<Icon data={info_circle} size={16} />
			<p className='pt-0.5'>Fact</p>
		</div>
	);
};

export const BoundaryLabel = ({ boundary }: BoundaryLabelProps) => {
	let bg = '';
	if (boundary === 'in') bg = '#CAE6FA';
	if (boundary === 'out') bg = '#FFD0CE';
	if (boundary === 'on') bg = '#FBDAC1';
	return (
		<div
			className={`rounded-xl bg-[${bg}] px-2 py-1 text-center 
            text-xs leading-4 font-medium text-[#585858]`}
		>
			<p className='pt-0.5 capitalize'>{boundary}</p>
		</div>
	);
};

type BoundaryLabelProps = {
	boundary: 'in' | 'out' | 'on';
};
