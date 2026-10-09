import { Button, Icon, Menu, Tooltip } from '@equinor/eds-core-react';
import {
	chevron_down,
	delete_to_trash,
	edit,
	functions,
	more_vertical,
	warning_outlined,
} from '@equinor/eds-icons';
import { NodeProps, useEdges } from '@xyflow/react';
import { ReactNode, use, useState } from 'react';
import { useHasInfluenceDiagramError } from '../../../hooks/useHasInfluenceDiagramError';
import { percentageIcon, utilityIcon } from '../../../icons';
import { ReactFlowInfluenceNode } from '../../../types';
import { cn } from '../../../utils/cn';
import { Issue } from '../../../validators';
import { DeleteIssueDialog } from '../../common/DeleteIssueDialog';
import { EditIssueModal } from '../../common/EditIssueModal';
import { InfluenceNodeShell } from './InfluenceNodeShell';
import { InfluenceShapeStates } from './InfluenceShapeStates';
import { PolicyTable } from './PolicyTable/PolicyTable';
import { ProbabilityTable as ProbabilityTableView } from './ProbabilityTable/ProbabilityTable';
import { SheetIssueIdContext } from './SheetIssueIdContext';
import { UtilityTable } from './UtilityTable/UtilityTable';
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
	tableType: 'policy' | 'probability' | 'utility';
	tableDisabled?: boolean;
	renderTable: (issue: Issue, onClose: (open: boolean) => void) => ReactNode;
};

const InfluenceShapeNode = ({
	id,
	issueId,
	selected,
	shape,
	getWarnings,
	canStartConnection,
	showStates = true,
	tableType,
	tableDisabled = false,
	renderTable,
}: InfluenceShapeNodeProps) => {
	const { issue, inProgress, isTarget } = useInfluenceNodeCommon(id, issueId);
	const sheetIssueId = use(SheetIssueIdContext);
	const [tableOpen, setTableOpen] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [menuAnchor, setMenuAnchor] = useState<HTMLButtonElement | null>(null);
	if (!issue) return null;
	const warnings = getWarnings(issue);
	const colors = shapeColorClasses[shape];
	const fill = selected || sheetIssueId === issue.id ? colors.active : colors.resting;
	const tableLabel =
		tableType === 'policy'
			? 'Policy table'
			: tableType === 'probability'
				? 'Probabilities'
				: 'Utility table';
	const tableIcon =
		tableType === 'policy'
			? functions
			: tableType === 'probability'
				? percentageIcon
				: utilityIcon;

	return (
		<>
			<div className='flex flex-col items-center gap-2'>
				<InfluenceNodeShell
					inProgress={inProgress}
					isTarget={isTarget}
					canStartConnection={canStartConnection}
					useConnector
					expandWidth={tableOpen}
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
						<h3
							className={cn(
								'text-diagram-text-strong relative text-center text-base leading-5 font-bold break-words',
								shape === 'diamond'
									? 'translate-y-0.5'
									: 'translate-y-[clamp(1px,calc(100%_-_1lh),2px)]',
							)}
						>
							{issue.name}
						</h3>
						{warnings.length > 0 && (
							<Tooltip title={warnings.join('\n')}>
								<div className='pointer-events-auto absolute -top-3 -right-3'>
									<Icon
										className='fill-warning-resting'
										data={warning_outlined}
									/>
								</div>
							</Tooltip>
						)}
						{showStates && <InfluenceShapeStates issue={issue} />}
						<div
							className={cn(
								`bg-background-default shadow-tile absolute top-1/2 right-[calc(100%+10px)] z-20 flex
								size-7 -translate-y-1/2 items-center justify-center rounded-full
								transition-opacity`,
								menuOpen
									? 'opacity-100'
									: 'opacity-0 group-hover/node:opacity-100 focus-within:opacity-100',
							)}
						>
							<Button
								ref={setMenuAnchor}
								variant='ghost_icon'
								onClick={event => {
									event.stopPropagation();
									setMenuOpen(true);
								}}
								className='nodrag nopan pointer-events-auto flex size-7! min-w-7! items-center
									justify-center rounded-full! p-0!'
							>
								<Icon data={more_vertical} size={18} />
							</Button>
						</div>
						<button
							type='button'
							disabled={tableDisabled}
							onClick={event => {
								event.stopPropagation();
								setTableOpen(open => !open);
							}}
							className={cn(
								`nodrag nopan bg-background-default border-background-medium text-text-tertiary absolute bottom-[calc(100%+8px)]
								left-1/2 z-10 flex max-w-40 -translate-x-1/2 cursor-pointer items-center
								gap-0.5 rounded-xl border py-0.5 pr-1 pl-2 text-xs leading-4
								font-medium whitespace-nowrap shadow-[0px_3px_4px_rgba(0,0,0,0.06)]
								transition-opacity`,
								tableOpen
									? 'opacity-100'
									: 'opacity-0 group-hover/node:opacity-100 focus-visible:opacity-100',
								tableDisabled && 'cursor-not-allowed opacity-50',
							)}
						>
							<span className='truncate'>{tableLabel}</span>
							<Icon data={chevron_down} size={18} className='fill-text-tertiary' />
						</button>
					</div>
				</InfluenceNodeShell>
				{tableOpen && renderTable(issue, setTableOpen)}
			</div>
			<div className='contents' onClick={event => event.stopPropagation()}>
				<Menu
					open={menuOpen}
					anchorEl={menuAnchor}
					onClose={() => setMenuOpen(false)}
					className='nodrag nopan nowheel'
				>
					<Menu.Item
						onClick={() => {
							setMenuOpen(false);
							setEditOpen(true);
						}}
					>
						<Icon data={edit} />
						<p>Edit</p>
					</Menu.Item>
					<Menu.Item
						onClick={() => {
							setMenuOpen(false);
							setDeleteOpen(true);
						}}
					>
						<Icon data={delete_to_trash} />
						<p>Delete</p>
					</Menu.Item>
					{tableType === 'policy' ? (
						<Menu.Item
							onClick={() => {
								setMenuOpen(false);
								setTableOpen(true);
							}}
						>
							<Icon data={tableIcon} />
							<p>Policy Table</p>
						</Menu.Item>
					) : tableType === 'probability' ? (
						<Menu.Item
							onClick={() => {
								setMenuOpen(false);
								setTableOpen(true);
							}}
						>
							<Icon data={tableIcon} />
							<p>Probabilities</p>
						</Menu.Item>
					) : (
						<Menu.Item
							disabled={tableDisabled}
							onClick={() => {
								setMenuOpen(false);
								setTableOpen(true);
							}}
						>
							<Icon data={tableIcon} />
							<p>Utility Table</p>
						</Menu.Item>
					)}
				</Menu>
			</div>
			<EditIssueModal issue={issue} open={editOpen} onClose={setEditOpen} />
			<DeleteIssueDialog issue={issue} open={deleteOpen} onClose={setDeleteOpen} />
		</>
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
			tableType='policy'
			renderTable={(issue, onClose) => (
				<PolicyTable issue={issue} selected={selected} onClose={onClose} />
			)}
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
			tableType='probability'
			renderTable={(issue, onClose) => (
				<ProbabilityTableView issue={issue} selected={selected} onClose={onClose} />
			)}
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
			tableType='utility'
			tableDisabled={!hasTwoOrMoreParents}
			renderTable={(issue, onClose) => (
				<UtilityTable issue={issue} selected={selected} onClose={onClose} />
			)}
			getWarnings={() =>
				hasTwoOrMoreParents
					? []
					: ['Connect 2+ parent nodes to enable utility table and solver']
			}
		/>
	);
};
