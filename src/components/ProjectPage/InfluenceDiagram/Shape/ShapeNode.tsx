import { Handle, NodeProps, Position } from '@xyflow/react';
import { useId, useState } from 'react';
import { useInfluenceDiagramEvidence } from '../../../../hooks/useInfluenceDiagramEvidence';
import { ReactFlowInfluenceNode } from '../../../../types';
import { cn } from '../../../../utils/cn';
import { IssueCardProvider } from '../../../common/Cards/IssueCard';
import { useInfluenceNodeCommon } from '../useInfluenceNodeCommon';
import { PolicyTable } from '../PolicyTable/PolicyTable';
import { ProbabilityTable } from '../ProbabilityTable/ProbabilityTable';
import { UtilityTable } from '../UtilityTable/UtilityTable';
import { ShapeNodeStatus } from './ShapeNodeStatus';
import { ShapeNodeMenu } from './ShapeNodeMenu';
import { ShapeNodeDetails } from './ShapeNodeDetails';
import { ShapeNodeTable } from './ShapeNodeTable';
import { ShapeArcHandle } from './ShapeArcHandle';

export const ShapeNode = ({ id, data, selected, type }: NodeProps<ReactFlowInfluenceNode>) => {
	const { issue, inProgress, isTarget } = useInfluenceNodeCommon(id, data.issue_id);
	const [tableOpen, setTableOpen] = useState(false);
	const maskId = useId();
	const { evidence, toggleEvidence } = useInfluenceDiagramEvidence();
	if (!issue) return null;
	const states =
		issue.type === 'Decision'
			? issue.decision.options
			: issue.type === 'Uncertainty'
				? issue.uncertainty.outcomes
				: [];
	const selectedState = states.find(state => evidence.includes(state.id));
	const Table =
		issue.type === 'Decision'
			? PolicyTable
			: issue.type === 'Uncertainty'
				? ProbabilityTable
				: UtilityTable;
	const shapePath =
		type === 'uncertainty'
			? 'M240 36C240 55.8823 186.274 72 120 72C53.7258 72 0 55.8823 0 36C0 16.1177 53.7258 0 120 0C186.274 0 240 16.1177 240 36Z'
			: 'M120 0L240 44L120 88L0 44L120 0Z';

	return (
		<IssueCardProvider
			issue={issue}
			selectedState={selectedState}
			onClickState={state => toggleEvidence(state.id, issue.id)}
		>
			<div className='nodrag nopan nowheel flex w-max flex-col items-center gap-1'>
				<div
					className={cn(
						'group/shape relative flex w-max flex-col items-center',
						'[&_.influence-shape-control:not(.connectingfrom)]:pointer-events-none! [&_.influence-shape-control:not(.connectingfrom)]:opacity-0 [&_.influence-shape-description]:pointer-events-none [&_.influence-shape-description]:invisible',
						'[&:has(.influence-shape-body:hover,.influence-shape-control:hover,.influence-shape-description:hover,:focus-visible,[aria-haspopup=menu][aria-expanded=true])_.influence-shape-control]:pointer-events-auto! [&:has(.influence-shape-body:hover,.influence-shape-control:hover,.influence-shape-description:hover,:focus-visible,[aria-haspopup=menu][aria-expanded=true])_.influence-shape-control]:opacity-100',
						'[&:has(.influence-shape-body:hover,.influence-shape-control:hover,.influence-shape-description:hover,:focus-visible,[aria-haspopup=menu][aria-expanded=true])_.influence-shape-description]:pointer-events-auto [&:has(.influence-shape-body:hover,.influence-shape-control:hover,.influence-shape-description:hover,:focus-visible,[aria-haspopup=menu][aria-expanded=true])_.influence-shape-description]:visible',
						String.raw`in-[.react-flow\_\_node:focus-visible]:[&_.influence-shape-control]:pointer-events-auto! in-[.react-flow\_\_node:focus-visible]:[&_.influence-shape-control]:opacity-100 in-[.react-flow\_\_node:focus-visible]:[&_.influence-shape-description]:pointer-events-auto in-[.react-flow\_\_node:focus-visible]:[&_.influence-shape-description]:visible`,
						String.raw`[.react-flow\_\_node:has(&_.influence-shape-body:hover,&_.influence-shape-control:hover,&_.influence-shape-description:hover,&_:focus-visible,&_[aria-haspopup=menu][aria-expanded=true])]:z-1001!`,
					)}
					data-selected={selected}
				>
					<div className='relative w-max max-w-60'>
						{issue.type !== 'Utility' && <ShapeArcHandle nodeId={id} />}
						{(!inProgress || isTarget) && (
							<Handle
								type='target'
								id='node-target'
								position={Position.Left}
								isConnectableStart={false}
								className={cn(
									'pointer-events-none! inset-0! z-10 size-full! transform-none! rounded-none! border-0! bg-transparent! opacity-0!',
									inProgress && 'pointer-events-auto!',
								)}
							/>
						)}
						{/* Keep the hover bridge behind the painted shape. */}
						<ShapeNodeMenu issue={issue} />
						<div
							data-color-scheme='light'
							className={cn(
								'influence-shape-body relative flex max-w-60 items-center justify-center px-4 py-3 text-center text-base leading-5 font-bold text-(--eds-color-text-strong)',
								type === 'decision'
									? String.raw`before:absolute before:inset-0 before:rounded-sm before:border-2 before:border-[color:var(--eds-color-border-warning-medium,#e89959)] before:bg-[var(--eds-color-bg-warning-canvas,#fff1e2)] before:content-[""] group-has-[.influence-shape-body:hover,.influence-shape-control:hover,.influence-shape-description:hover,:focus-visible,[aria-haspopup=menu][aria-expanded=true]]/shape:before:bg-[var(--eds-color-bg-warning-fill-muted-hover,#f6caaa)] group-data-[selected=true]/shape:before:bg-[var(--eds-color-bg-warning-fill-muted-active,#f0b689)]! in-[.react-flow\_\_node:focus-visible]:before:bg-[var(--eds-color-bg-warning-fill-muted-hover,#f6caaa)]`
									: 'pointer-events-none',
								type === 'uncertainty' && 'px-6 py-4',
								type === 'utility' && 'px-10 py-6',
							)}
						>
							{type !== 'decision' && (
								<svg
									aria-hidden
									viewBox={`0 0 240 ${type === 'uncertainty' ? 72 : 88}`}
									preserveAspectRatio='none'
									className={cn(
										'pointer-events-none absolute inset-0 size-full',
										type === 'uncertainty'
											? String.raw`fill-[#eafbe8] group-has-[.influence-shape-body:hover,.influence-shape-control:hover,.influence-shape-description:hover,:focus-visible,[aria-haspopup=menu][aria-expanded=true]]/shape:fill-[#bbe0b8] group-data-[selected=true]/shape:fill-[#a2d49e]! in-[.react-flow\_\_node:focus-visible]:fill-[#bbe0b8]`
											: String.raw`fill-[#e7f8ff] group-has-[.influence-shape-body:hover,.influence-shape-control:hover,.influence-shape-description:hover,:focus-visible,[aria-haspopup=menu][aria-expanded=true]]/shape:fill-[#b5daf5] group-data-[selected=true]/shape:fill-[#99cbf0]! in-[.react-flow\_\_node:focus-visible]:fill-[#b5daf5]`,
									)}
								>
									<defs>
										<mask id={maskId}>
											<path d={shapePath} fill='white' />
										</mask>
									</defs>
									<path d={shapePath} className='pointer-events-auto' />
									<path
										d={shapePath}
										mask={`url(#${maskId})`}
										strokeWidth={4}
										className={cn(
											'fill-none',
											type === 'uncertainty'
												? 'stroke-[#7cc278]'
												: 'stroke-[#6fb6e9]',
										)}
									/>
								</svg>
							)}
							<span className='pointer-events-auto relative min-w-0 wrap-anywhere'>
								{issue.name}
							</span>
						</div>
						<ShapeNodeStatus nodeId={id} issue={issue} />
						<ShapeNodeTable
							nodeId={id}
							issue={issue}
							open={tableOpen}
							onToggle={() => setTableOpen(open => !open)}
						/>
					</div>
					<ShapeNodeDetails issue={issue} tableOpen={tableOpen} />
				</div>
				{tableOpen && <Table issue={issue} selected={selected} onClose={setTableOpen} />}
			</div>
		</IssueCardProvider>
	);
};
