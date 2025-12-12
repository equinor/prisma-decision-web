export const ParentTypeIndicator = ({ kind }: ParentTypeIndicatorProps) => {
	if (kind === 'decision') {
		return <div className='h-4 w-4 border border-[#696969] bg-[#FFF7D0]' />;
	}
	return <div className='h-4 w-4 rounded-full border border-[#696969] bg-[#E1FCEA]' />;
};

type ParentTypeIndicatorProps = {
	kind: 'decision' | 'uncertainty';
};
