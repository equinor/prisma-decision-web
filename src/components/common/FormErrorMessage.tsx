import { Icon } from '@equinor/eds-core-react';
import { warning_outlined } from '@equinor/eds-icons';
import { ReactNode } from 'react';

export const FormErrorMessage = ({ children }: FormMessageErrorProps) => {
	if (!children) return null;
	return (
		<div className='flex items-center gap-2 text-sm'>
			<Icon data={warning_outlined} size={16} className='text-text-warning min-h-4 min-w-4' />
			<p className='text-text-warning pt-1'>{children}</p>
		</div>
	);
};

type FormMessageErrorProps = {
	children: ReactNode;
};
