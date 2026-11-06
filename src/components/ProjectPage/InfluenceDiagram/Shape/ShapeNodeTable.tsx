import { Button, Icon } from '@equinor/eds-core-react/next';
import { arrow_drop_down } from '@equinor/eds-icons';
import { useEdges } from '@xyflow/react';
import { cn } from '../../../../utils/cn';
import { Issue } from '../../../../validators';

export const ShapeNodeTable = ({
	nodeId,
	issue,
	open,
	onToggle,
}: {
	nodeId: string;
	issue: Issue;
	open: boolean;
	onToggle: () => void;
}) => {
	const edges = useEdges();
	const disabled =
		issue.type === 'Utility' && edges.filter(edge => edge.target === nodeId).length < 2;
	const label =
		issue.type === 'Decision'
			? 'Policy table'
			: issue.type === 'Uncertainty'
				? 'Probability table'
				: 'Utility table';

	return (
		<div
			className={cn(
				'nodrag nopan nowheel absolute inset-x-0 bottom-full flex justify-center pb-2',
				!open && 'influence-shape-control',
			)}
			onClick={event => event.stopPropagation()}
		>
			<Button
				aria-expanded={open}
				onClick={onToggle}
				disabled={disabled}
				variant='secondary'
				tone='neutral'
				size='small'
				className='h-7! min-h-0! rounded-full! border-(--eds-color-border-neutral-medium)! bg-(--eds-color-bg-floating)! px-3! py-0.5! text-sm! leading-5! font-normal! whitespace-nowrap text-(--eds-color-text-subtle)!'
			>
				{label}
				<Icon data={arrow_drop_down} size='sm' />
			</Button>
		</div>
	);
};
