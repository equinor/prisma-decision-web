import { TextField } from '@equinor/eds-core-react';
import { ReactFlow, useNodesState, type Node, type NodeProps } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useMemo, useState } from 'react';
import { useGetStakeholderMatrixes } from '../../../hooks/api/useGetStakeholderMatrixes';
import type { StakeholderMatrix as StakeholderMatrixRecord } from '../../../validators';
import { LoadingSpinner } from '../../common/LoadingSpinner';
import { useSelectedProject } from '../ProjectContext';
import { CreateStakeholderMatrix } from './CreateStakeholderMatrix';
import { DeleteStakeholderMatrixDialog } from './DeleteStakeholderMatrixDialog';
import { EditStakeholderMatrix } from './EditStakeholderMatrix';

type StakeholderMatrixProps = {
	className?: string;
};

const regionColors = {
	consult: '#d1495b',
	partnerClosely: '#007f8b',
	observe: '#5b5bd6',
	keepInformed: '#2e8540',
};

const stakeholderRegions = [
	{ key: 'partnerClosely', label: 'Partner closely', affecting: 1, affected: 1 },
	{ key: 'consult', label: 'Consult', affecting: 0, affected: 1 },
	{ key: 'keepInformed', label: 'Keep informed', affecting: 1, affected: 0 },
	{ key: 'observe', label: 'Observe', affecting: 0, affected: 0 },
] as const;

const getRegionKey = (affectingDecision: number, affectedByDecision: number) => {
	if (affectedByDecision) {
		return affectingDecision ? 'partnerClosely' : 'consult';
	}
	return affectingDecision ? 'keepInformed' : 'observe';
};

type MatrixBackgroundData = {
	[key: string]: unknown;
	width: number;
	height: number;
};

type StakeholderNodeData = {
	[key: string]: unknown;
	name: string;
	role: string;
	color: string;
};

type MatrixBackgroundNode = Node<MatrixBackgroundData, 'matrixBackground'>;
type StakeholderNode = Node<StakeholderNodeData, 'stakeholder'>;
type StakeholderMatrixNode = MatrixBackgroundNode | StakeholderNode;

const MATRIX_WIDTH = 1000;
const MIN_REGION_HEIGHT = 300;
const NODE_WIDTH = 104;
const NODE_HEIGHT = 34;
const NODE_COLUMNS = 2;
const NODE_GAP_X = 12;
const NODE_GAP_Y = 8;
const REGION_PADDING_X = 28;
const REGION_HEADER_HEIGHT = 58;
const AXIS_GUTTER_WIDTH = 112;
const AXIS_GUTTER_BOTTOM = 40;

const MatrixBackground = ({ data }: NodeProps<MatrixBackgroundNode>) => (
	<div
		className='text-text-default relative'
		style={{
			width: data.width + AXIS_GUTTER_WIDTH,
			height: data.height + AXIS_GUTTER_BOTTOM,
		}}
	>
		<div
			className='border-text-tertiary absolute top-0 grid grid-cols-2 border'
			style={{ left: AXIS_GUTTER_WIDTH, width: data.width, height: data.height }}
		>
			{[
				{ label: 'CONSULT', color: 'rgba(209, 73, 91, 0.12)' },
				{ label: 'PARTNER CLOSELY', color: 'rgba(0, 127, 139, 0.12)' },
				{ label: 'OBSERVE', color: 'rgba(91, 91, 214, 0.11)' },
				{ label: 'KEEP INFORMED', color: 'rgba(46, 133, 64, 0.11)' },
			].map(region => (
				<div
					key={region.label}
					className='border-text-tertiary border-r border-b p-4 text-xs font-semibold last:border-r-0'
					style={{ backgroundColor: region.color }}
				>
					{region.label}
				</div>
			))}
			<div className='absolute inset-x-0 -bottom-8 text-center text-sm'>
				<span className='absolute left-0'>Low</span>
				Affecting the decision
				<span className='absolute right-0'>High →</span>
			</div>
		</div>
		<div
			className='absolute top-0 bottom-10 flex flex-col justify-between text-sm'
			style={{ left: AXIS_GUTTER_WIDTH - 44 }}
		>
			<span>High ↑</span>
			<span>Low</span>
		</div>
		<div className='absolute top-1/2 left-5 -translate-y-1/2 -rotate-90 text-sm whitespace-nowrap'>
			Affected by the decision
		</div>
	</div>
);

const StakeholderCardNode = ({ data }: NodeProps<StakeholderNode>) => (
	<div
		className='bg-background-default shadow-raised flex cursor-grab rounded-sm border-l-2 px-1.5 py-0.5 active:cursor-grabbing'
		style={{ width: NODE_WIDTH, minHeight: NODE_HEIGHT, borderLeftColor: data.color }}
	>
		<span className='min-w-0'>
			<span className='block truncate text-[11px] font-semibold' title={data.name}>
				{data.name}
			</span>
			<span className='text-text-tertiary block truncate text-[9px]' title={data.role}>
				{data.role}
			</span>
		</span>
	</div>
);

const nodeTypes = {
	matrixBackground: MatrixBackground,
	stakeholder: StakeholderCardNode,
};

type MatrixCanvasProps = {
	initialNodes: StakeholderMatrixNode[];
	stakeholderCount: number;
};

const MatrixCanvas = ({ initialNodes, stakeholderCount }: MatrixCanvasProps) => {
	const [nodes, , onNodesChange] = useNodesState<StakeholderMatrixNode>(initialNodes);

	return (
		<ReactFlow
			nodes={nodes}
			onNodesChange={onNodesChange}
			nodeTypes={nodeTypes}
			nodesConnectable={false}
			elementsSelectable={false}
			panOnDrag={false}
			autoPanOnNodeDrag={false}
			zoomOnScroll={false}
			zoomOnPinch={false}
			zoomOnDoubleClick={false}
			fitView
			fitViewOptions={{ padding: 0.15 }}
			proOptions={{ hideAttribution: true }}
			aria-label={`Stakeholder matrix with ${stakeholderCount} stakeholders`}
		/>
	);
};

const buildMatrixNodes = (stakeholders: StakeholderMatrixRecord[]): StakeholderMatrixNode[] => {
	const regionCounts = stakeholders.reduce<Record<string, number>>((counts, stakeholder) => {
		const regionKey = getRegionKey(
			stakeholder.affecting_the_decision,
			stakeholder.affected_by_the_decision,
		);
		counts[regionKey] = (counts[regionKey] ?? 0) + 1;
		return counts;
	}, {});
	const largestRegion = Math.max(0, ...Object.values(regionCounts));
	const regionRows = Math.max(1, Math.ceil(largestRegion / NODE_COLUMNS));
	const regionHeight = Math.max(
		MIN_REGION_HEIGHT,
		REGION_HEADER_HEIGHT + regionRows * (NODE_HEIGHT + NODE_GAP_Y) + NODE_GAP_Y,
	);
	const matrixHeight = regionHeight * 2;
	const positionsByRegion = new Map<string, number>();
	const nodes: StakeholderMatrixNode[] = [
		{
			id: 'matrix-background',
			type: 'matrixBackground',
			position: { x: -AXIS_GUTTER_WIDTH, y: 0 },
			data: { width: MATRIX_WIDTH, height: matrixHeight },
			draggable: false,
			selectable: false,
			focusable: false,
			zIndex: 0,
		},
	];

	stakeholders.forEach(stakeholder => {
		const regionKey = getRegionKey(
			stakeholder.affecting_the_decision,
			stakeholder.affected_by_the_decision,
		);
		const positionInRegion = positionsByRegion.get(regionKey) ?? 0;
		positionsByRegion.set(regionKey, positionInRegion + 1);
		const column = positionInRegion % NODE_COLUMNS;
		const row = Math.floor(positionInRegion / NODE_COLUMNS);
		const regionLeft = stakeholder.affecting_the_decision ? MATRIX_WIDTH / 2 : 0;
		const regionTop = stakeholder.affected_by_the_decision ? 0 : regionHeight;

		nodes.push({
			id: stakeholder.stakeholder_matrix_id,
			type: 'stakeholder',
			position: {
				x: regionLeft + REGION_PADDING_X + column * (NODE_WIDTH + NODE_GAP_X),
				y: regionTop + REGION_HEADER_HEIGHT + row * (NODE_HEIGHT + NODE_GAP_Y),
			},
			data: {
				name: stakeholder.stakeholder_name,
				role: stakeholder.stakeholder_role,
				color: regionColors[regionKey],
			},
			draggable: true,
			selectable: false,
			focusable: false,
			extent: [
				[regionLeft, regionTop],
				[regionLeft + MATRIX_WIDTH / 2, regionTop + regionHeight],
			],
			zIndex: 1,
		});
	});

	return nodes;
};

const getMatrixRevision = (stakeholders: StakeholderMatrixRecord[]) =>
	JSON.stringify(
		stakeholders.map(stakeholder => [
			stakeholder.stakeholder_matrix_id,
			stakeholder.stakeholder_name,
			stakeholder.stakeholder_role,
			stakeholder.affecting_the_decision,
			stakeholder.affected_by_the_decision,
		]),
	);

export const StakeholderMatrix = ({ className = '' }: StakeholderMatrixProps) => {
	const [searchQuery, setSearchQuery] = useState('');
	const selectedProject = useSelectedProject();
	const { stakeholderMatrices, isLoading } = useGetStakeholderMatrixes(selectedProject.id);
	const normalizedSearchQuery = searchQuery.trim().toLocaleLowerCase();
	const filteredStakeholders = stakeholderMatrices.filter(stakeholder =>
		`${stakeholder.stakeholder_name} ${stakeholder.stakeholder_role}`
			.toLocaleLowerCase()
			.includes(normalizedSearchQuery),
	);

	const generatedMatrixNodes = useMemo(
		() => buildMatrixNodes(stakeholderMatrices),
		[stakeholderMatrices],
	);
	const matrixRevision = getMatrixRevision(stakeholderMatrices);

	return (
		<div className={`flex w-full flex-col gap-5 py-2 ${className}`}>
			<header className='flex flex-wrap items-start justify-between gap-4'>
				<div>
					<div className='flex items-center gap-3'>
						<h1 className='text-3xl font-bold'>Stakeholder Matrix</h1>
						<span className='bg-background-medium rounded-sm px-2 py-1 text-xs font-semibold'>
							{stakeholderMatrices.length}{' '}
							{stakeholderMatrices.length === 1 ? 'stakeholder' : 'stakeholders'}
						</span>
					</div>
					<p className='text-text-tertiary mt-1 text-sm'>
						Assess how much a stakeholder affects the decision and how strongly the
						decision affects them.
					</p>
				</div>
				<CreateStakeholderMatrix />
			</header>

			<div className='grid items-stretch gap-5 xl:grid-cols-[minmax(0,1fr)_320px]'>
				<section className='bg-background-default shadow-tile min-w-0 rounded-md p-4 sm:p-6'>
					<div className='text-text-tertiary mb-3 flex flex-wrap gap-x-5 gap-y-1 text-xs'>
						<span>
							<strong className='text-text-default'>Horizontal:</strong> influence on
							the decision
						</span>
						<span>
							<strong className='text-text-default'>Vertical:</strong> impact from the
							decision
						</span>
					</div>
					<div
						className='bg-background-light relative min-h-125 w-full overflow-hidden rounded-sm'
						style={{ height: 'calc(100vh - 240px)' }}
					>
						<MatrixCanvas
							key={matrixRevision}
							initialNodes={generatedMatrixNodes}
							stakeholderCount={stakeholderMatrices.length}
						/>
						{isLoading && <LoadingSpinner />}
					</div>
					{!isLoading && stakeholderMatrices.length === 0 && (
						<p className='text-text-tertiary text-center text-sm'>
							No stakeholders yet. Create one to add it to the matrix.
						</p>
					)}
				</section>

				<aside className='bg-background-default shadow-tile flex h-[calc(100vh-240px)] min-h-125 flex-col overflow-hidden rounded-md xl:w-80'>
					<div className='border-border-medium border-b px-4 py-3'>
						<h2 className='text-base font-semibold'>Stakeholders</h2>
						<p className='text-text-tertiary text-xs'>Grouped by matrix region</p>
					</div>
					<div className='border-border-medium border-b p-3'>
						<TextField
							label='Search stakeholders'
							placeholder='Name or role'
							value={searchQuery}
							onChange={event => setSearchQuery(event.target.value)}
						/>
					</div>
					<div className='min-h-0 flex-1 overflow-y-auto p-2'>
						{stakeholderRegions.map(region => {
							const regionStakeholders = filteredStakeholders
								.filter(
									stakeholder =>
										stakeholder.affecting_the_decision === region.affecting &&
										stakeholder.affected_by_the_decision === region.affected,
								)
								.sort((first, second) =>
									first.stakeholder_name.localeCompare(second.stakeholder_name),
								);
							if (regionStakeholders.length === 0) return null;

							return (
								<section key={region.key} className='mb-3 last:mb-0'>
									<div className='bg-background-light sticky top-0 z-10 flex items-center gap-2 px-3 py-2'>
										<span
											className='h-2.5 w-2.5 rounded-full'
											style={{
												backgroundColor: regionColors[region.key],
											}}
										/>
										<h3 className='flex-1 text-xs font-semibold uppercase'>
											{region.label}
										</h3>
										<span className='text-text-tertiary text-xs'>
											{regionStakeholders.length}
										</span>
									</div>
									{regionStakeholders.map(stakeholder => (
										<div
											key={stakeholder.stakeholder_matrix_id}
											className='hover:bg-background-light flex items-center rounded-sm pr-1'
										>
											<div className='flex min-w-0 flex-1 items-center gap-3 px-3 py-3 text-left'>
												<span className='min-w-0 flex-1'>
													<span className='block truncate text-sm font-semibold'>
														{stakeholder.stakeholder_name}
													</span>
													<span className='text-text-tertiary block truncate text-xs'>
														{stakeholder.stakeholder_role}
													</span>
													<span className='mt-1.5 flex flex-wrap gap-1 text-[11px]'>
														<span className='bg-background-medium rounded-sm px-1.5 py-0.5'>
															Affecting:{' '}
															{stakeholder.affecting_the_decision
																? 'High'
																: 'Low'}
														</span>
														<span className='bg-background-medium rounded-sm px-1.5 py-0.5'>
															Affected:{' '}
															{stakeholder.affected_by_the_decision
																? 'High'
																: 'Low'}
														</span>
													</span>
												</span>
											</div>
											<div className='flex shrink-0'>
												<EditStakeholderMatrix stakeholder={stakeholder} />
												<DeleteStakeholderMatrixDialog
													stakeholder={stakeholder}
												/>
											</div>
										</div>
									))}
								</section>
							);
						})}
						{!isLoading && stakeholderMatrices.length === 0 && (
							<p className='text-text-tertiary px-3 py-8 text-center text-sm'>
								Your stakeholder list will appear here.
							</p>
						)}
						{!isLoading &&
							stakeholderMatrices.length > 0 &&
							filteredStakeholders.length === 0 && (
								<p className='text-text-tertiary px-3 py-8 text-center text-sm'>
									No stakeholders match your search.
								</p>
							)}
					</div>
				</aside>
			</div>
		</div>
	);
};

export default StakeholderMatrix;
