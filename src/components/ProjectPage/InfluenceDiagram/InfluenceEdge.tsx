import { Button, Icon } from '@equinor/eds-core-react';
import { delete_to_trash, more_vertical } from '@equinor/eds-icons';
import {
	BaseEdge,
	Edge,
	EdgeLabelRenderer,
	EdgeProps,
	useNodes,
	useReactFlow,
} from '@xyflow/react';
import { useState } from 'react';
import { useAnimatedInfluenceRoute } from '../../../hooks/useAnimatedInfluenceRoute';
import { ReactFlowInfluenceNode } from '../../../types';
import { InfluenceEdgeData } from '../../../utils/convertToInfluenceEdges';
import { useCreateRestrictionTables } from '../../../hooks/api/useCreateRestrictionTables';
import { useSelectedProject } from '../ProjectContext';
import { useSelectedProjectRestrictionTables } from '../../../hooks/useSelectedProjectRestrictionTables';
import { useSelectedProjectIssues } from '../../../hooks/useSelectedProjectIssues';
import { RestrictionTable } from './RestrictionTable/RestrictionTable';
import { useHasInfluenceDiagramError } from '../../../hooks/useHasInfluenceDiagramError';
import { cn } from '../../../utils/cn';

export const InfluenceEdge = ({ id, source, target, data }: EdgeProps<Edge<InfluenceEdgeData>>) => {
	const path = useAnimatedInfluenceRoute(data?.route);
	const {
		validationErrors: { edgesInLoop },
	} = useHasInfluenceDiagramError();
	const labelX = data?.route?.labelX ?? 0;
	const labelY = data?.route?.labelY ?? 0;
	const [isPanelOpen, setIsPanelOpen] = useState(false);
	const { mutate: createRestrictionTable, isPending: isCreatingRestrictionTable } =
		useCreateRestrictionTables();
	const { deleteElements } = useReactFlow<ReactFlowInfluenceNode, Edge<InfluenceEdgeData>>();

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
	const openRestrictionTable = () => {
		setIsPanelOpen(prev => !prev);
	};

	const handleDelete = async () => {
		deleteElements({ edges: [{ id }] });
	};

	const onClickLabel = () => {
		if (!targetIsUtility) {
			openRestrictionTable();
			return;
		}
		handleDelete();
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

	return (
		<>
			<svg>
				<defs>
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
								'fill-warning-resting! stroke-warning-resting!': edgesInLoop.find(
									x => x.id === id,
								),
								'fill-primary-resting! stroke-primary-resting!': !edgesInLoop.find(
									x => x.id === id,
								),
							})}
							strokeLinecap='round'
							strokeLinejoin='round'
							points='-5,-4 0,0 -5,4 -5,-4'
						></polyline>
					</marker>
				</defs>
			</svg>
			<BaseEdge
				id={id}
				path={path}
				interactionWidth={60}
				markerEnd={`url(#${id})`}
				className={cn('stroke-primary-resting! stroke-4!', {
					'stroke-warning-resting!': edgesInLoop.find(x => x.id === id),
				})}
			/>
			<EdgeLabelRenderer>
				<>
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
										onDeleteEdge={handleDelete}
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
