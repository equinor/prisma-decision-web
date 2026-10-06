import { TextField } from '@equinor/eds-core-react';
import { ReactFlow, useNodesState, type Node, type NodeProps } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useMemo, useState } from 'react';
import { useGetStakeholderMatrixes } from '../../../hooks/api/useGetStakeholderMatrixes';
import { useUpdateStakeholderMatrix } from '../../../hooks/api/useUpdateStakeholderMatrix';
import type { StakeholderMatrix as StakeholderMatrixRecord } from '../../../validators';
import { LoadingSpinner } from '../../common/LoadingSpinner';
import { useSelectedProject } from '../ProjectContext';
import { CreateStakeholderMatrix } from './CreateStakeholderMatrix';
import { DeleteStakeholderMatrixDialog } from './DeleteStakeholderMatrixDialog';
import { EditStakeholderMatrix } from './EditStakeholderMatrix';

type StakeholderMatrixProps = {
	className?: string;
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
	region: keyof typeof stakeholderRegions;
};

type MatrixBackgroundNode = Node<MatrixBackgroundData, 'matrixBackground'>;
type StakeholderNode = Node<StakeholderNodeData, 'stakeholder'>;
type StakeholderMatrixNode = MatrixBackgroundNode | StakeholderNode;

const stakeholderRegions = {
	partnerClosely: {
		label: 'Partner closely',
		background: 'bg-[#007f8b]',
		border: 'border-l-[#007f8b]',
		matrixClassName: 'col-start-2 row-start-1 bg-[#007f8b]/12',
	},
	consult: {
		label: 'Consult',
		background: 'bg-[#d1495b]',
		border: 'border-l-[#d1495b]',
		matrixClassName: 'col-start-1 row-start-1 bg-[#d1495b]/12',
	},
	keepInformed: {
		label: 'Keep informed',
		background: 'bg-[#2e8540]',
		border: 'border-l-[#2e8540]',
		matrixClassName: 'col-start-2 row-start-2 bg-[#2e8540]/11',
	},
	observe: {
		label: 'Observe',
		background: 'bg-[#5b5bd6]',
		border: 'border-l-[#5b5bd6]',
		matrixClassName: 'col-start-1 row-start-2 bg-[#5b5bd6]/11',
	},
} as const;

const getRegionKey = (affectingDecision: number, affectedByDecision: number) => {
	if (affectedByDecision >= 0.5) {
		return affectingDecision >= 0.5 ? 'partnerClosely' : 'consult';
	}
	return affectingDecision >= 0.5 ? 'keepInformed' : 'observe';
};

const MATRIX_WIDTH = 1450;
const MATRIX_HEIGHT = 800;
const NODE_WIDTH = 100;
const NODE_HEIGHT = 34;

const clampAxisValue = (value: number) => Math.min(1, Math.max(0, value));

const getStakeholderPosition = (affecting: number, affected: number) => ({
	x: clampAxisValue(affecting) * (MATRIX_WIDTH - NODE_WIDTH),
	y: (1 - clampAxisValue(affected)) * (MATRIX_HEIGHT - NODE_HEIGHT),
});

const getStakeholderValues = (position: { x: number; y: number }) => ({
	affecting_the_decision: clampAxisValue(position.x / (MATRIX_WIDTH - NODE_WIDTH)),
	affected_by_the_decision: clampAxisValue(1 - position.y / (MATRIX_HEIGHT - NODE_HEIGHT)),
});

const MatrixBackground = () => (
	<div
		className='text-text-default relative'
		style={{ width: MATRIX_WIDTH, height: MATRIX_HEIGHT + 32 }}
	>
		<div
			className='border-text-tertiary absolute inset-x-0 top-0 grid grid-cols-2 grid-rows-2 border'
			style={{ height: MATRIX_HEIGHT }}
		>
			{Object.entries(stakeholderRegions).map(([regionKey, region]) => (
				<div
					key={regionKey}
					className={`border-text-tertiary border-r border-b p-4 text-xs font-semibold uppercase last:border-r-0 ${region.matrixClassName}`}
				>
					{region.label}
				</div>
			))}

			<div className='absolute inset-x-0 -bottom-8 text-center text-sm'>
				<span className='absolute left-0'>Low (0)</span>
				Affecting the decision
				<span className='absolute right-0'>High (1) →</span>
			</div>
			<div className='absolute inset-y-0 -left-26 flex w-24 flex-col items-center justify-between text-sm whitespace-nowrap'>
				<span>High (1) ↑</span>
				<span className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90'>
					Affected by the decision
				</span>
				<span>Low (0)</span>
			</div>
		</div>
	</div>
);

const StakeholderCardNode = ({ data }: NodeProps<StakeholderNode>) => (
	<div
		className={`bg-background-default shadow-raised flex h-8.5 w-25 cursor-grab rounded-sm border-l-2 px-1.5 py-0.5 active:cursor-grabbing ${stakeholderRegions[data.region].border}`}
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
	onStakeholderMove: (id: string, values: ReturnType<typeof getStakeholderValues>) => void;
};

const MatrixCanvas = ({ initialNodes, stakeholderCount, onStakeholderMove }: MatrixCanvasProps) => {
	const [nodes, , onNodesChange] = useNodesState<StakeholderMatrixNode>(initialNodes);

	return (
		<ReactFlow
			nodes={nodes}
			onNodesChange={onNodesChange}
			onNodeDragStop={(_event, node) => {
				if (node.type !== 'stakeholder') return;
				onStakeholderMove(node.id, getStakeholderValues(node.position));
			}}
			nodeTypes={nodeTypes}
			nodesConnectable={false}
			elementsSelectable={false}
			panOnDrag={false}
			autoPanOnNodeDrag={false}
			zoomOnScroll={false}
			zoomOnPinch={false}
			zoomOnDoubleClick={false}
			fitView
			fitViewOptions={{ padding: 0.08 }}
			proOptions={{ hideAttribution: true }}
			aria-label={`Stakeholder matrix with ${stakeholderCount} stakeholders`}
		/>
	);
};

const buildMatrixNodes = (stakeholders: StakeholderMatrixRecord[]): StakeholderMatrixNode[] => {
	const nodes: StakeholderMatrixNode[] = [
		{
			id: 'matrix-background',
			type: 'matrixBackground',
			position: { x: 0, y: 0 },
			data: { width: MATRIX_WIDTH, height: MATRIX_HEIGHT },
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
		nodes.push({
			id: stakeholder.stakeholder_matrix_id,
			type: 'stakeholder',
			position: getStakeholderPosition(
				stakeholder.affecting_the_decision,
				stakeholder.affected_by_the_decision,
			),
			data: {
				name: stakeholder.stakeholder_name,
				role: stakeholder.stakeholder_role,
				region: regionKey,
			},
			draggable: true,
			selectable: false,
			focusable: false,
			extent: [
				[0, 0],
				[MATRIX_WIDTH, MATRIX_HEIGHT],
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
	const { mutate: updateStakeholder } = useUpdateStakeholderMatrix();
	const handleStakeholderMove = (id: string, values: ReturnType<typeof getStakeholderValues>) => {
		const stakeholder = stakeholderMatrices.find(
			current => current.stakeholder_matrix_id === id,
		);
		if (!stakeholder) return;
		updateStakeholder({ ...stakeholder, ...values });
	};
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
		<div
			className={`flex h-[calc(100dvh-144px)] min-h-0 w-full flex-col gap-5 py-2 ${className}`}
		>
			<header className='flex shrink-0 flex-wrap items-start justify-between gap-4'>
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

			<div className='grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_minmax(0,1fr)] items-stretch gap-5 xl:grid-cols-[minmax(0,1fr)_320px] xl:grid-rows-[minmax(0,1fr)]'>
				<section className='bg-background-default shadow-tile flex min-h-0 min-w-0 flex-col rounded-md p-4 sm:p-6'>
					<div className='bg-background-light relative min-h-0 w-full flex-1 overflow-hidden rounded-sm'>
						<MatrixCanvas
							key={matrixRevision}
							initialNodes={generatedMatrixNodes}
							stakeholderCount={stakeholderMatrices.length}
							onStakeholderMove={handleStakeholderMove}
						/>
						{isLoading && <LoadingSpinner />}
					</div>
					{!isLoading && stakeholderMatrices.length === 0 && (
						<p className='text-text-tertiary text-center text-sm'>
							No stakeholders yet. Create one to add it to the matrix.
						</p>
					)}
				</section>

				<aside className='bg-background-default shadow-tile flex min-h-0 flex-col overflow-hidden rounded-md xl:w-80'>
					<div className='border-border-medium shrink-0 border-b px-4 py-3'>
						<h2 className='text-base font-semibold'>Stakeholders</h2>
						<p className='text-text-tertiary text-xs'>Grouped by matrix region</p>
					</div>
					<div className='border-border-medium shrink-0 border-b p-3'>
						<TextField
							label='Search stakeholders'
							placeholder='Name or role'
							value={searchQuery}
							onChange={event => setSearchQuery(event.target.value)}
						/>
					</div>
					<div className='min-h-0 flex-1 overflow-y-auto p-2'>
						{Object.entries(stakeholderRegions).map(([regionKey, region]) => {
							const regionStakeholders = filteredStakeholders
								.filter(
									stakeholder =>
										getRegionKey(
											stakeholder.affecting_the_decision,
											stakeholder.affected_by_the_decision,
										) === regionKey,
								)
								.sort((first, second) =>
									first.stakeholder_name.localeCompare(second.stakeholder_name),
								);
							if (regionStakeholders.length === 0) return null;

							return (
								<section key={regionKey} className='mb-3 last:mb-0'>
									<div className='bg-background-light sticky top-0 z-10 flex items-center gap-2 px-3 py-2'>
										<span
											className={`h-2.5 w-2.5 rounded-full ${region.background}`}
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
															{stakeholder.affecting_the_decision.toFixed(
																2,
															)}
														</span>
														<span className='bg-background-medium rounded-sm px-1.5 py-0.5'>
															Affected:{' '}
															{stakeholder.affected_by_the_decision.toFixed(
																2,
															)}
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
