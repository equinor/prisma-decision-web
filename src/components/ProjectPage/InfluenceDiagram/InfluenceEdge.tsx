import { Button, Icon } from '@equinor/eds-core-react';
import { delete_to_trash, more_vertical } from '@equinor/eds-icons';
import { BaseEdge, Edge, EdgeLabelRenderer, EdgeProps, useNodes } from '@xyflow/react';
import { useState } from 'react';
import { useAnimatedInfluenceRoute } from '../../../hooks/useAnimatedInfluenceRoute';
import { useInfluenceDiagramNodeView } from '../../../hooks/useInfluenceDiagramNodeView';
import { ReactFlowInfluenceNode } from '../../../types';
import { InfluenceEdgeData } from '../../../utils/convertToInfluenceEdges';
import { useCreateRestrictionTables } from '../../../hooks/api/useCreateRestrictionTables';
import { useSelectedProject } from '../ProjectContext';
import { useSelectedProjectRestrictionTables } from '../../../hooks/useSelectedProjectRestrictionTables';
import { useSelectedProjectIssues } from '../../../hooks/useSelectedProjectIssues';
import { RestrictionTable } from './RestrictionTable/RestrictionTable';
import { useHasInfluenceDiagramError } from '../../../hooks/useHasInfluenceDiagramError';
import { cn } from '../../../utils/cn';
import { DeleteEdgeDialog } from '../../common/DeleteEdgeDialog';

export const InfluenceEdge = ({ id, source, target, data }: EdgeProps<Edge<InfluenceEdgeData>>) => {
	const path = useAnimatedInfluenceRoute(data?.route);
	const [nodeView] = useInfluenceDiagramNodeView();
	const isShapeView = nodeView === 'shape';
	const {
		validationErrors: { edgesInLoop },
	} = useHasInfluenceDiagramError();
	const isInLoop = edgesInLoop.some(x => x.id === id);
	const labelX = data?.route?.labelX ?? 0;
	const labelY = data?.route?.labelY ?? 0;
	const [isPanelOpen, setIsPanelOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const { mutate: createRestrictionTable, isPending: isCreatingRestrictionTable } =
		useCreateRestrictionTables();

	const project = useSelectedProject();
	const nodes = useNodes<ReactFlowInfluenceNode>();
	const issues = useSelectedProjectIssues();
	const { restrictionTables } = useSelectedProjectRestrictionTables();
	const restrictionTable = restrictionTables.find(table => table.edge_id === id);
	const sourceNode = nodes.find(node => node.id === source);
	const targetNode = nodes.find(node => node.id === target);
	const sourceIssue = issues.find(issue => issue.id === sourceNode?.data.issue_id);
	const targetIssue = issues.find(issue => issue.id === targetNode?.data.issue_id);

	const targetIsUtility = targetIssue?.type === 'Utility';
	const hasRestriction =
		restrictionTable &&
		restrictionTable.restriction_entries.some(entry => !entry.restriction_value);
	const openRestrictionTable = () => {
		setIsPanelOpen(prev => !prev);
	};

	const onClickLabel = () => {
		if (!targetIsUtility) {
			openRestrictionTable();
			return;
		}
		setIsDeleteDialogOpen(true);
	};

	const onLabelMouseEnter = () => {
		if (restrictionTable) return;
		createRestrictionTable({
			id: crypto.randomUUID(),
			project_id: project.id,
			edge_id: id,
			restriction_entries: [],
		});
	};

	const labelIcon = targetIsUtility ? delete_to_trash : more_vertical;
	const isHighlighted = !!data?.hovered || isPanelOpen;

	return (
		<>
			<svg>
				<defs>
					{isShapeView ? (
						<marker
							id={id}
							markerWidth='8'
							markerHeight='14'
							viewBox='0 0 8 14'
							markerUnits='userSpaceOnUse'
							orient='auto'
							refX='8'
							refY='7'
						>
							<path
								d='M0 0L8 7L0 14Z'
								className={cn('fill-diagram-edge', {
									'fill-warning-resting': isInLoop,
									'fill-primary-resting': isHighlighted,
								})}
							/>
						</marker>
					) : (
						<marker
							className='react-flow__arrowhead'
							id={id}
							markerWidth='12.5'
							markerHeight='12.5'
							viewBox='-10 -10 20 20'
							markerUnits='strokeWidth'
							orient='auto-start-reverse'
							refX='0'
							refY='0'
						>
							<polyline
								className={cn('arrowclosed', {
									'fill-warning-resting! stroke-warning-resting!':
										isInLoop && !isHighlighted,
									'fill-primary-resting! stroke-primary-resting!':
										!isInLoop && !isHighlighted,
									'fill-primary-hover! stroke-primary-hover!': isHighlighted,
								})}
								strokeLinecap='round'
								strokeLinejoin='round'
								points='-5,-4 0,0 -5,4 -5,-4'
							></polyline>
						</marker>
					)}
				</defs>
			</svg>
			<BaseEdge
				id={id}
				path={path}
				// Narrower than the gap between parallel edges so hit areas don't hide neighbours
				interactionWidth={12}
				markerEnd={`url(#${id})`}
				style={{ strokeDasharray: hasRestriction ? '12 8' : undefined }}
				className={cn(
					'transition-[stroke]',
					isShapeView
						? 'stroke-diagram-edge! stroke-2!'
						: 'stroke-primary-resting! stroke-4!',
					{
						'stroke-warning-resting!': isInLoop && !isHighlighted,
						'stroke-primary-resting!': isShapeView && isHighlighted,
						'stroke-primary-hover!': !isShapeView && isHighlighted,
					},
				)}
			/>
			<EdgeLabelRenderer>
				<>
					{sourceIssue && targetIssue && (
						<DeleteEdgeDialog
							edgeId={id}
							sourceIssue={sourceIssue}
							targetIssue={targetIssue}
							open={isDeleteDialogOpen}
							onClose={setIsDeleteDialogOpen}
						/>
					)}
					<div
						className='nodrag nopan pointer-events-auto absolute z-10 origin-center'
						style={{
							transform: `translate(-50%, 12px) translate(${labelX}px, ${labelY}px)`,
						}}
					>
						{isPanelOpen && (
							<div className='shadow-lg'>
								{restrictionTable && sourceIssue && targetIssue ? (
									<RestrictionTable
										restrictionTable={restrictionTable}
										sourceIssue={sourceIssue}
										targetIssue={targetIssue}
										onClose={setIsPanelOpen}
										onDeleteEdge={() => setIsDeleteDialogOpen(true)}
									/>
								) : (
									<div className='border-background-medium bg-background-default text-text-tertiary w-87.5 rounded-sm border border-dashed px-3 py-2 text-xs'>
										{isCreatingRestrictionTable
											? 'Preparing restriction table...'
											: 'Restriction table is not available for this edge.'}
									</div>
								)}
							</div>
						)}
					</div>
					<div
						className='nodrag nopan pointer-events-auto absolute z-10 origin-center'
						style={{
							transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
						}}
					>
						{(data?.hovered || isPanelOpen) && (
							<Button
								variant='ghost_icon'
								className={cn({
									'bg-background-light! hover:bg-primary-hover-alt! outline-primary-hover-alt p-1! outline-1!':
										!targetIsUtility,
								})}
								color={targetIsUtility ? 'danger' : 'primary'}
								onClick={onClickLabel}
								onMouseEnter={onLabelMouseEnter}
							>
								<Icon data={labelIcon} />
							</Button>
						)}
					</div>
				</>
			</EdgeLabelRenderer>
		</>
	);
};
