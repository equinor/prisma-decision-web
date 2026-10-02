import { Icon, Tooltip } from '@equinor/eds-core-react';
import { warning_outlined } from '@equinor/eds-icons';
import { NodeProps, useEdges } from '@xyflow/react';
import { use } from 'react';
import { useHasInfluenceDiagramError } from '../../../hooks/useHasInfluenceDiagramError';
import { ReactFlowInfluenceNode } from '../../../types';
import { cn } from '../../../utils/cn';
import { Issue } from '../../../validators';
import { InfluenceNodeShell } from './InfluenceNodeShell';
import { InfluenceShapeStates } from './InfluenceShapeStates';
import { SheetIssueIdContext } from './SheetIssueIdContext';
import { useInfluenceNodeCommon } from './useInfluenceNodeCommon';

type Shape = 'rectangle' | 'ellipse' | 'diamond';

const shapePaddingClass: Record<Shape, string> = {
	rectangle: 'px-4 py-3',
	ellipse: 'px-6 py-4',
	diamond: 'px-10 py-6',
};

// Full class strings so Tailwind can detect them
const shapeColorClasses: Record<Shape, { resting: string; active: string; border: string }> = {
	rectangle: {
		resting: 'bg-diagram-decision-canvas group-hover/node:bg-diagram-decision-hover',
		active: 'bg-diagram-decision-active',
		border: 'border-diagram-decision-border',
	},
	ellipse: {
		resting: 'bg-diagram-uncertainty-canvas group-hover/node:bg-diagram-uncertainty-hover',
		active: 'bg-diagram-uncertainty-active',
		border: 'border-diagram-uncertainty-border',
	},
	diamond: {
		resting: 'fill-diagram-utility-canvas group-hover/node:fill-diagram-utility-hover',
		active: 'fill-diagram-utility-active',
		border: 'stroke-diagram-utility-border',
	},
};

type InfluenceShapeNodeProps = {
	id: string;
	issueId: string;
	selected: boolean;
	shape: Shape;
	getWarnings: (issue: Issue) => string[];
	canStartConnection?: boolean;
	showStates?: boolean;
};

const InfluenceShapeNode = ({
	id,
	issueId,
	selected,
	shape,
	getWarnings,
	canStartConnection,
	showStates = true,
}: InfluenceShapeNodeProps) => {
	const { issue, inProgress, isTarget } = useInfluenceNodeCommon(id, issueId);
	const sheetIssueId = use(SheetIssueIdContext);
	if (!issue) return null;
	const warnings = getWarnings(issue);
	const colors = shapeColorClasses[shape];
	const fill = selected || sheetIssueId === issue.id ? colors.active : colors.resting;

	return (
		<InfluenceNodeShell
			inProgress={inProgress}
			isTarget={isTarget}
			canStartConnection={canStartConnection}
			useConnector
		>
			<div
				className={cn(
					'relative flex w-max max-w-60 items-center justify-center',
					shapePaddingClass[shape],
				)}
			>
				{shape === 'diamond' ? (
					<svg
						className='absolute inset-0 h-full w-full overflow-visible'
						viewBox='0 0 100 100'
						preserveAspectRatio='none'
					>
						<polygon
							points='50,0 100,50 50,100 0,50'
							strokeWidth={2}
							vectorEffect='non-scaling-stroke'
							className={cn(fill, colors.border)}
						/>
					</svg>
				) : (
					<div
						className={cn('absolute inset-0 border-2', fill, colors.border, {
							'rounded-sm': shape === 'rectangle',
							'rounded-[50%]': shape === 'ellipse',
						})}
					/>
				)}
				<h3 className='text-diagram-text-strong relative text-center text-base leading-5 font-bold break-words'>
					{issue.name}
				</h3>
				{warnings.length > 0 && (
					<Tooltip title={warnings.join('\n')}>
						<div className='pointer-events-auto absolute -top-3 -right-3'>
							<Icon className='fill-warning-resting' data={warning_outlined} />
						</div>
					</Tooltip>
				)}
				{showStates && <InfluenceShapeStates issue={issue} />}
			</div>
		</InfluenceNodeShell>
	);
};

export const DecisionShapeNode = ({ id, data, selected }: NodeProps<ReactFlowInfluenceNode>) => {
	const {
		validationErrors: { DecisionOptions },
	} = useHasInfluenceDiagramError();

	return (
		<InfluenceShapeNode
			id={id}
			issueId={data.issue_id}
			selected={selected}
			shape='rectangle'
			getWarnings={issue =>
				DecisionOptions.includes(issue.id) ? ['Has missing options'] : []
			}
		/>
	);
};

export const UncertaintyShapeNode = ({ id, data, selected }: NodeProps<ReactFlowInfluenceNode>) => {
	const {
		validationErrors: { UncertaintyOutcomes, ProbabilityTable },
	} = useHasInfluenceDiagramError();

	return (
		<InfluenceShapeNode
			id={id}
			issueId={data.issue_id}
			selected={selected}
			shape='ellipse'
			getWarnings={issue => [
				...(UncertaintyOutcomes.includes(issue.id) ? ['Has missing outcomes'] : []),
				...(ProbabilityTable.includes(issue.id) ? ['Has invalid probability table'] : []),
			]}
		/>
	);
};

export const UtilityShapeNode = ({ id, data, selected }: NodeProps<ReactFlowInfluenceNode>) => {
	const edges = useEdges();
	const hasTwoOrMoreParents = edges.filter(edge => edge.target === data.id).length >= 2;

	return (
		<InfluenceShapeNode
			id={id}
			issueId={data.issue_id}
			selected={selected}
			shape='diamond'
			canStartConnection={false}
			showStates={false}
			getWarnings={() =>
				hasTwoOrMoreParents
					? []
					: ['Connect 2+ parent nodes to enable utility table and solver']
			}
		/>
	);
};
