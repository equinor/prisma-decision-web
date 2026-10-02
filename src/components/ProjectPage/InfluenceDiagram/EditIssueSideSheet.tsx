import { Button, Icon } from '@equinor/eds-core-react';
import { close } from '@equinor/eds-icons';
import { useCallback, useState } from 'react';
import { useInfluenceDiagramEvidence } from '../../../hooks/useInfluenceDiagramEvidence';
import { useSelectedProjectEdges } from '../../../hooks/useSelectedProjectEdges';
import { useSelectedProjectIssues } from '../../../hooks/useSelectedProjectIssues';
import { useSelectedProjectRestrictionTables } from '../../../hooks/useSelectedProjectRestrictionTables';
import { cn } from '../../../utils/cn';
import { Issue } from '../../../validators';
import { EditIssueForm } from '../../common/EditIssueForm';
import { ForceState } from '../ProjectIssues/IssueFormSections/ForceStateButton';
import { PolicyTable } from './PolicyTable/PolicyTable';
import { ProbabilityTable } from './ProbabilityTable/ProbabilityTable';
import { UtilityTable } from './UtilityTable/UtilityTable';

const tableLabels: Partial<Record<Issue['type'], string>> = {
	Decision: 'Policy table',
	Uncertainty: 'Probability table',
	Utility: 'Utility table',
};

export const EditIssueSideSheet = ({ issueId, onClose }: EditIssueSideSheetProps) => {
	const issue = useSelectedProjectIssues().find(currentIssue => currentIssue.id === issueId);
	const [view, setView] = useState<'details' | 'table'>('details');
	const [animateViewSwitch, setAnimateViewSwitch] = useState(false);
	const [prevIssueId, setPrevIssueId] = useState(issueId);
	const [hasSwitchedIssue, setHasSwitchedIssue] = useState(false);
	if (prevIssueId !== issueId) {
		setPrevIssueId(issueId);
		setHasSwitchedIssue(true);
		setView('details');
		setAnimateViewSwitch(false);
	}
	const forceState = useForceState(issue);
	const { edges } = useSelectedProjectEdges();
	const [tableWidth, setTableWidth] = useState(0);
	const measureTable = useCallback((node: HTMLDivElement | null) => {
		if (!node) return;
		const observer = new ResizeObserver(([entry]) =>
			setTableWidth(entry.borderBoxSize[0].inlineSize),
		);
		observer.observe(node);
		return () => observer.disconnect();
	}, []);
	if (!issue) return null;

	const tableLabel = tableLabels[issue.type];
	const parentCount = edges.filter(edge => edge.head_id === issue.node.id).length;
	const tableDisabled = issue.type === 'Utility' && parentCount < 2;
	const showTable = view === 'table' && !tableDisabled;
	const switchView = (nextView: 'details' | 'table') => {
		if (nextView === view) return;
		setView(nextView);
		setAnimateViewSwitch(true);
	};
	const backToDetails = () => switchView('details');
	const viewSwitchClass = animateViewSwitch && 'motion-safe:animate-sheet-view-switch';
	// Explicit lengths (not `auto`) so the width change can transition; 48px = p-6 on both sides
	const detailsWidth = 'min(480px, 90vw)';
	const width = showTable
		? `min(max(${tableWidth + 48}px, ${detailsWidth}), calc(100% - 2rem))`
		: detailsWidth;

	return (
		<aside
			data-no-dnd
			style={{ width }}
			className='nodrag nopan nowheel bg-background-default shadow-tile motion-safe:animate-sheet-open
				absolute top-0 right-0 bottom-0 z-20 cursor-auto overflow-auto rounded-sm
				motion-safe:transition-[width] motion-safe:duration-500
				motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)]'
		>
			{/* Remounts per issue so form state resets; the aside itself stays mounted */}
			<div
				key={issue.id}
				className={cn('flex flex-col gap-4 p-6', {
					'motion-safe:animate-sheet-content-change': hasSwitchedIssue,
				})}
			>
				<div className='flex items-center justify-between gap-4'>
					<h2 className='text-2xl font-semibold'>{issue.name}</h2>
					<Button variant='ghost_icon' onClick={onClose}>
						<Icon data={close} />
					</Button>
				</div>
				{tableLabel && (
					<Button.Toggle selectedIndexes={[showTable ? 1 : 0]} className='self-start'>
						<Button onClick={backToDetails}>Details</Button>
						<Button
							onClick={() => switchView('table')}
							disabled={tableDisabled}
							title={
								tableDisabled
									? 'Connect 2+ parent nodes to enable utility table'
									: undefined
							}
						>
							{tableLabel}
						</Button>
					</Button.Toggle>
				)}
				{/* Kept mounted while viewing tables to preserve unsaved edits */}
				<div className={cn(viewSwitchClass, { hidden: showTable })}>
					<EditIssueForm
						issue={issue}
						onClose={onClose}
						forceState={forceState}
						hideHeader
					/>
				</div>
				{showTable && (
					<div ref={measureTable} className={cn('w-max', viewSwitchClass)}>
						{issue.type === 'Decision' && (
							<PolicyTable issue={issue} selected={false} onClose={backToDetails} />
						)}
						{issue.type === 'Uncertainty' && (
							<ProbabilityTable
								issue={issue}
								selected={false}
								onClose={backToDetails}
							/>
						)}
						{issue.type === 'Utility' && (
							<UtilityTable issue={issue} selected={false} onClose={backToDetails} />
						)}
					</div>
				)}
			</div>
		</aside>
	);
};

const useForceState = (issue: Issue | undefined): ForceState | undefined => {
	const { evidence, toggleEvidence } = useInfluenceDiagramEvidence();
	const { fullyRestrictedStateIds } = useSelectedProjectRestrictionTables();
	if (!issue) return;
	const savedStateIds =
		issue.type === 'Decision'
			? issue.decision.options.map(option => option.id)
			: issue.type === 'Uncertainty'
				? issue.uncertainty.outcomes.map(outcome => outcome.id)
				: [];
	if (!savedStateIds.length) return;

	const selectedId = evidence.find(id => savedStateIds.includes(id));
	return {
		selectedId,
		isDisabled: stateId =>
			!savedStateIds.includes(stateId) ||
			(fullyRestrictedStateIds.includes(stateId) && stateId !== selectedId),
		onToggle: stateId => toggleEvidence(stateId, issue.id),
	};
};

type EditIssueSideSheetProps = {
	issueId: string;
	onClose: () => void;
};
