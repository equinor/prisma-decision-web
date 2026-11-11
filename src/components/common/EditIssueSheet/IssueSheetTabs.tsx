import { Tab, TabList, TabPanel, TabProvider } from '@ariakit/react';
import { Banner, Icon } from '@equinor/eds-core-react/next';
import { info_circle } from '@equinor/eds-icons';
import { ReactNode, useId, useState } from 'react';
import { useIssueFormContext } from '../../../hooks/useIssueForm';
import { useSelectedProjectEdges } from '../../../hooks/useSelectedProjectEdges';
import { cn } from '../../../utils/cn';
import { isIssueInInfluenceDiagram } from '../../../utils/isIssueInInfluenceDiagram';
import { Issue } from '../../../validators';
import { PolicyConditionalTable } from '../../ProjectPage/InfluenceDiagram/PolicyTable/PolicyTable';
import { ProbabilityConditionalTable } from '../../ProjectPage/InfluenceDiagram/ProbabilityTable/ProbabilityTable';
import { ResetProbabilitiesButton } from '../../ProjectPage/InfluenceDiagram/ProbabilityTable/ResetProbabilitiesButton';
import { ResetUtilitiesButton } from '../../ProjectPage/InfluenceDiagram/UtilityTable/ResetUtilitiesButton';
import { UtilityConditionalTable } from '../../ProjectPage/InfluenceDiagram/UtilityTable/UtilityTable';

export const IssueSheetTabs = ({
	issue,
	pending,
	children,
}: {
	issue: Issue;
	pending: boolean;
	children: ReactNode;
}) => {
	const detailsTabId = useId();
	const tableTabId = useId();
	const [tab, setTab] = useState<string | null>(detailsTabId);
	const {
		formState: { isDirty },
	} = useIssueFormContext();
	const { edges } = useSelectedProjectEdges();
	const tableLabel = isIssueInInfluenceDiagram(issue)
		? issue.type === 'Decision'
			? 'Policy table'
			: issue.type === 'Uncertainty'
				? 'Probability table'
				: 'Utility table'
		: undefined;
	const utilityDisabled =
		issue.type === 'Utility' &&
		edges.filter(edge => edge.head_issue_id === issue.id || edge.head_id === issue.node.id)
			.length < 2;
	const onDetails = !tableLabel || tab !== tableTabId;
	const disabled = isDirty || pending;
	return (
		<TabProvider
			selectedId={onDetails ? detailsTabId : tableTabId}
			setSelectedId={value => setTab(value ?? detailsTabId)}
		>
			<TabList
				aria-label='Issue editor tabs'
				className='border-background-medium flex w-fit border-b-2'
			>
				<Tab
					id={detailsTabId}
					className='text-text-secondary aria-selected:text-primary-resting aria-selected:border-primary-resting -mb-0.5 border-b-2 border-transparent px-4 py-3 text-base'
				>
					Details
				</Tab>
				{tableLabel && (
					<Tab
						id={tableTabId}
						disabled={utilityDisabled}
						aria-describedby={utilityDisabled ? `${tableTabId}-reason` : undefined}
						className='text-text-secondary aria-selected:text-primary-resting aria-selected:border-primary-resting -mb-0.5 border-b-2 border-transparent px-4 py-3 text-base aria-disabled:opacity-50'
					>
						{tableLabel}
					</Tab>
				)}
			</TabList>
			{tableLabel && utilityDisabled && (
				<p id={`${tableTabId}-reason`} className='text-text-tertiary text-sm'>
					Connect 2+ parent nodes to enable utility table and solver
				</p>
			)}
			<TabPanel tabId={detailsTabId} hidden={!onDetails}>
				{children}
			</TabPanel>
			{tableLabel && (
				<TabPanel
					tabId={tableTabId}
					hidden={onDetails}
					unmountOnHide
					className='flex min-w-0 flex-col gap-4'
				>
					{isDirty && (
						<Banner tone='info' className='rounded-sm border! px-3! py-2!'>
							<Banner.Icon>
								<Icon data={info_circle} />
							</Banner.Icon>
							<Banner.Message>
								The table is disabled until your changes are saved
							</Banner.Message>
						</Banner>
					)}
					<div
						className={cn('overflow-x-auto', disabled && 'opacity-40')}
						inert={disabled}
					>
						<div className='flex justify-end pt-1 pb-2 empty:hidden'>
							{issue.type === 'Uncertainty' && (
								<ResetProbabilitiesButton issue={issue} />
							)}
							{issue.type === 'Utility' && <ResetUtilitiesButton issue={issue} />}
						</div>
						{issue.type === 'Decision' && <PolicyConditionalTable issue={issue} />}
						{issue.type === 'Uncertainty' && (
							<ProbabilityConditionalTable issue={issue} />
						)}
						{issue.type === 'Utility' && <UtilityConditionalTable issue={issue} />}
					</div>
				</TabPanel>
			)}
		</TabProvider>
	);
};
