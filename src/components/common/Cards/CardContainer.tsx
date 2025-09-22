import React from 'react';
import { cn } from '../../../utils/cn';

export const CardContainer = ({ className, ...props }: CardContainerProps) => {
	return (
		<div
			className={cn(
				`bg-background-default shadow-tile relative flex w-full
                 min-w-[241px] cursor-grab flex-col gap-2 rounded-sm p-4`,
				className,
			)}
			{...props}
		/>
	);
};

type CardContainerProps = {
	children: React.ReactNode;
} & React.ComponentProps<'div'>;
