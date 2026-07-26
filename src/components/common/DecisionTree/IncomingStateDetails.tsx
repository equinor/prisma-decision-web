import { cn } from '../../../utils/cn';
import { DecisionTreeIncomingState } from './types';

type IncomingStateDetailsProps = {
	incomingState?: DecisionTreeIncomingState;
	className?: string;
};

export const IncomingStateDetails = ({
	incomingState,
	className = '',
}: IncomingStateDetailsProps) => {
	if (!incomingState) return null;

	return (
		<div
			className={cn(
				'bg-background-light flex h-full flex-col justify-start px-2 py-2 text-xs',
				className,
			)}
		>
			<p className='text-text-secondary text-[10px] font-medium tracking-[0.08em] uppercase'>
				State
			</p>
			<p
				className='text-text-default mt-1 truncate text-sm font-semibold'
				title={incomingState.label}
			>
				{incomingState.label}
			</p>
			<div className='text-text-secondary mt-1.5 space-y-1 text-[11px]'>
				{incomingState.probability !== undefined && (
					<p>
						<span className='text-text-secondary font-semibold'>Prob:</span>{' '}
						{Math.round(incomingState.probability * 100) / 100}
					</p>
				)}
				<p>
					<span className='text-text-secondary font-semibold'>Utility:</span>{' '}
					{Math.round(incomingState.utility)}
				</p>
			</div>
		</div>
	);
};
