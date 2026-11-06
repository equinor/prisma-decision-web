import { Tooltip } from '@equinor/eds-core-react';
import { Icon } from '@equinor/eds-core-react/next';
import { error_outlined, warning_outlined } from '@equinor/eds-icons';
import { useEdges } from '@xyflow/react';
import { useHasInfluenceDiagramError } from '../../../../hooks/useHasInfluenceDiagramError';
import { cn } from '../../../../utils/cn';
import { Issue } from '../../../../validators';

export const ShapeNodeStatus = ({ nodeId, issue }: { nodeId: string; issue: Issue }) => {
	const { validationErrors } = useHasInfluenceDiagramError();
	const edges = useEdges();
	const errors: string[] = [];
	const warnings: string[] = [];

	if (validationErrors.DecisionOptions.includes(issue.id)) errors.push('Has missing options');
	if (validationErrors.UncertaintyOutcomes.includes(issue.id))
		errors.push('Has missing outcomes');
	if (validationErrors.ProbabilityTable.includes(issue.id))
		errors.push('Has invalid probability table');
	if (
		validationErrors.edgesInLoop.some(edge => edge.source === nodeId || edge.target === nodeId)
	) {
		errors.push('Has arcs in a loop');
	}
	if (issue.type === 'Utility' && edges.filter(edge => edge.target === nodeId).length < 2) {
		warnings.push('Connect 2+ parent nodes to enable utility table and solver');
	}
	if (!errors.length && !warnings.length) return null;
	const hasError = errors.length > 0;

	return (
		<div className='absolute -top-4 -right-4 z-20'>
			<Tooltip
				title={
					<ul>
						{[...errors, ...warnings].map(message => (
							<li key={message}>{message}</li>
						))}
					</ul>
				}
			>
				<span
					role='img'
					aria-label={`${hasError ? 'Error' : 'Warning'}: ${issue.name}`}
					tabIndex={0}
					className={cn(
						'nodrag nopan flex size-8 items-center justify-center rounded-full border-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--eds-color-border-accent-strong)',
						hasError
							? 'border-(--eds-color-border-danger-medium) bg-(--eds-color-bg-danger-fill-muted-default) text-(--eds-color-text-danger-strong)'
							: 'border-(--eds-color-border-warning-medium) bg-(--eds-color-bg-warning-fill-muted-default) text-(--eds-color-text-warning-strong)',
					)}
				>
					<Icon
						data={hasError ? error_outlined : warning_outlined}
						size={hasError ? 'lg' : 'md'}
					/>
				</span>
			</Tooltip>
		</div>
	);
};
