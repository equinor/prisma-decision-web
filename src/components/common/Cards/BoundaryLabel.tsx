import { cn } from '../../../utils/cn';

export const BoundaryLabel = ({ boundary }: BoundaryLabelProps) => {
	return (
		<div
			className={cn(
				'rounded-xl px-2 py-1 text-center text-xs leading-4 font-medium text-[#585858]',
				{
					'bg-[#CAE6FA] text-[#015E8D]': boundary === 'in',
					'bg-[#FFD0CE] text-[#A50827]': boundary === 'out',
					'bg-[#FBDAC1] text-[#8A4100]': boundary === 'on',
				},
			)}
		>
			<p className='pt-0.5 capitalize'>{boundary}</p>
		</div>
	);
};

type BoundaryLabelProps = {
	boundary: 'in' | 'out' | 'on';
};
