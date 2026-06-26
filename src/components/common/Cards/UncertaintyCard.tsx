import { Button, EdsProvider, Icon, Menu } from '@equinor/eds-core-react';
import { chevron_down, chevron_up, delete_to_trash, edit, more_vertical } from '@equinor/eds-icons';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { useState } from 'react';
import { useExpandCard } from '../../../hooks/useExpandCard';
import { percentageIcon } from '../../../icons';
import { cn } from '../../../utils/cn';
import { Issue, Outcome } from '../../../validators';
import { sortByCreatedAt } from '../../../utils/sortByCreatedAt';
import { DeleteIssueDialog } from '../DeleteIssueDialog';
import { EditIssueModal } from '../EditIssueModal';
import { BoundaryLabel } from './BoundaryLabel';
import { CardContainer } from './CardContainer';
import { UncertaintyLabel } from './IssueLabel';
import { useProbablityTable } from '../../ProjectPage/InfluenceDiagram/ProbabilityTable/useProbablityTable';
import { useInfluenceDiagramEvidence } from '../../../hooks/useInfluenceDiagramEvidence';

export const UncertaintyCard = ({
	issue,
	canExpand = true,
	onClickOutcome,
	selectedOutcome,
	onClickOpenProbabilities,
	disableZeroProbabilityOutcomes = false,
	expanded: expandedProp,
	...rest
}: UncertaintyCardProps) => {
	const sortedOutcomes = sortByCreatedAt(issue.uncertainty.outcomes);

	const hasOutcomes = sortedOutcomes.length > 0;
	const { expanded: _expanded, toggle } = useExpandCard(issue.id);
	const [menuOpen, setMenuOpen] = useState(false);
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const expanded = expandedProp ?? _expanded;
	const { evidence } = useInfluenceDiagramEvidence();
	const { rows } = useProbablityTable(issue);
	const outcomesWithZeroProbability = new Set<string>();

	if (disableZeroProbabilityOutcomes) {
		if (evidence.length === 1) {
			const selectedEvidenceId = evidence[0];
			const outcomeParentProbabilities = new Map<
				string,
				Array<{ parentIds: string[]; probability: number }>
			>();

			rows.forEach(row => {
				row.probabilities.forEach(prob => {
					const parentIds = [...prob.parent_option_ids, ...prob.parent_outcome_ids];
					if (!parentIds.includes(selectedEvidenceId)) return;
					const existing = outcomeParentProbabilities.get(prob.outcome_id) ?? [];

					existing.push({
						parentIds,
						probability: prob.probability,
					});

					outcomeParentProbabilities.set(prob.outcome_id, existing);
				});
			});
			outcomeParentProbabilities.forEach((parentProbabilities, outcomeId) => {
				const allProbabilitiesZero = parentProbabilities.every(
					prob => prob.probability === 0,
				);
				if (allProbabilitiesZero) outcomesWithZeroProbability.add(outcomeId);
			});
		} else {
			outcomesWithZeroProbability.clear();
			rows.forEach(row => {
				const firstProbability = row.probabilities[0];
				if (!firstProbability) return;

				const rowParentIds = [
					...firstProbability.parent_option_ids,
					...firstProbability.parent_outcome_ids,
				];
				const rowMatchesEvidence = rowParentIds.every(parentId =>
					evidence.includes(parentId),
				);
				if (!rowMatchesEvidence) return;

				row.probabilities.forEach(prob => {
					if (prob.probability === 0) outcomesWithZeroProbability.add(prob.outcome_id);
				});
			});
		}
	}
	const enabledOutcomes = sortedOutcomes.filter(
		outcome => !outcomesWithZeroProbability.has(outcome.id),
	);
	const impliedSelectedOutcomeId =
		enabledOutcomes.length === 1 ? enabledOutcomes[0].id : undefined;
	const activeOutcomeId = selectedOutcome?.id ?? impliedSelectedOutcomeId;
	return (
		<CardContainer {...rest} onDoubleClick={() => setEditOpen(true)}>
			<div className='flex items-center justify-between'>
				<div className='flex gap-2'>
					<UncertaintyLabel />
					<BoundaryLabel boundary={issue.boundary} />
				</div>
				<div>
					<Button
						ref={setAnchorEl}
						onClick={() => setMenuOpen(true)}
						variant='ghost_icon'
						className='nodrag nopan pointer-events-auto'
					>
						<Icon data={more_vertical} />
					</Button>
					<Menu open={menuOpen} onClose={() => setMenuOpen(false)} anchorEl={anchorEl}>
						<Menu.Item onClick={() => setEditOpen(true)}>
							<Icon data={edit} />
							<p>Edit</p>
						</Menu.Item>
						<Menu.Item onClick={() => setDeleteOpen(true)}>
							<Icon data={delete_to_trash} />
							<p>Delete</p>
						</Menu.Item>
						{onClickOpenProbabilities && (
							<Menu.Item onClick={onClickOpenProbabilities}>
								<Icon data={percentageIcon} className='ml-1' />
								<p>Probabilities</p>
							</Menu.Item>
						)}
					</Menu>
				</div>
			</div>
			<div>
				<h3 className='font-semibold '>{issue.name}</h3>
				<p
					className={cn('text-text-tertiary line-clamp-1 text-sm', {
						'line-clamp-none': canExpand && expanded,
					})}
				>
					{issue.description}
				</p>
			</div>
			{(canExpand || expanded) && (
				<Collapsible
					open={expanded}
					onOpenChange={toggle}
					className={cn({
						'pb-7': canExpand,
					})}
				>
					<CollapsibleContent className='mb-2 w-full' asChild>
						{hasOutcomes && (
							<ul className='flex flex-col gap-2 rounded-sm text-sm'>
								{sortedOutcomes.map(outcome => {
									const isDisabled = outcomesWithZeroProbability.has(outcome.id);

									return (
										<li
											onClick={() => {
												if (isDisabled) return;
												if (onClickOutcome) onClickOutcome(outcome);
											}}
											key={outcome.id}
											className={cn(
												'bg-background-light pointer-events-auto flex justify-between rounded-sm px-2 py-1',
												{
													'hover:bg-primary-hover-alt cursor-pointer':
														onClickOutcome && !isDisabled,
													'cursor-not-allowed opacity-50': isDisabled,
													'outline-primary-resting outline-2':
														outcome.id === activeOutcomeId,
												},
											)}
										>
											<p className='truncate'>{outcome.name}</p>
											<p className='truncate'>{outcome.utility}</p>
										</li>
									);
								})}
							</ul>
						)}
					</CollapsibleContent>
					<EdsProvider density='compact'>
						{canExpand && (
							<CollapsibleTrigger asChild>
								<button className='nodrag nopan pointer-events-auto absolute right-2 bottom-1 flex cursor-pointer items-center gap-2'>
									<p className='text-text-tertiary text-sm'>
										{sortedOutcomes.length} Outcomes
									</p>
									<Icon
										className='fill-primary-resting'
										data={expanded ? chevron_up : chevron_down}
									/>
								</button>
							</CollapsibleTrigger>
						)}
					</EdsProvider>
				</Collapsible>
			)}
			<EditIssueModal issue={issue} open={editOpen} onClose={() => setEditOpen(false)} />
			<DeleteIssueDialog
				issue={issue}
				open={deleteOpen}
				onClose={() => setDeleteOpen(false)}
			/>
		</CardContainer>
	);
};

type UncertaintyCardProps = {
	issue: Issue;
	className?: string;
	canExpand?: boolean;
	onClickOutcome?: (outcome: Outcome) => void;
	selectedOutcome?: Outcome;
	onClickOpenProbabilities?: () => void;
	disableZeroProbabilityOutcomes?: boolean;
	expanded?: boolean;
};
