import React from 'react';
import { cn } from '../../../utils/cn';

export const CardContainer = ({ className, ...props }: CardContainerProps) => {
	return (
		<div
			className={cn(
				`bg-background-default shadow-tile relative flex w-full
                 min-w-60.25 cursor-grab flex-col gap-2 rounded-sm px-2 py-1`,
				className,
			)}
			{...props}
		/>
	);
};

type CardContainerProps = {
	children: React.ReactNode;
} & React.ComponentProps<'div'>;
