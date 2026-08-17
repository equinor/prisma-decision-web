import React from 'react';
import { cn } from '../../../utils/cn';
import { getDiagramIssueBorderColor } from '../../../utils/getDiagramIssueBorderColor';
import { IssueType } from '../../../validators';

export const CardContainer = ({
	className,
	issueType,
	selected,
	expandWidth,
	includeBorder,
	...props
}: CardContainerProps) => {
	return (
		<div
			className={cn(
				`bg-background-default shadow-tile relative flex w-full
                 min-w-60.25 cursor-grab flex-col gap-2 rounded-sm px-2 py-1`,
				className,
				getDiagramIssueBorderColor(issueType, !!selected),
				{
					'w-auto': expandWidth,
					'border-2': includeBorder,
				},
			)}
			{...props}
		/>
	);
};

type CardContainerProps = {
	children: React.ReactNode;
	issueType: IssueType;
	selected?: boolean;
	expandWidth?: boolean;
	includeBorder?: boolean;
} & React.ComponentProps<'div'>;
