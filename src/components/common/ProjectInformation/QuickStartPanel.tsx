import { Button } from '@equinor/eds-core-react';
import { format, parseISO } from 'date-fns';
import type { ReactNode } from 'react';
import {
	getApprovedItems,
	isDiagramIssue,
	type QuickStartItem,
	type QuickStartResponse,
} from '../../../utils/quickStart';
import { objectiveTypes, type IssueType, type ObjectiveType } from '../../../validators';
import { AiIcon } from '../AiIcon';
import { IssueTypeLabel } from '../Cards/IssueTypeLabel';
import { QuickStartDiagram } from './QuickStartDiagram';

const notDiscussed = <p className='text-(color:--eds-text-secondary)'>Not discussed yet</p>;
const missingValue = <span className='italic'>Missing</span>;
const dashed = 'underline decoration-dashed underline-offset-4';

const Section = ({
	title,
	count,
	children,
}: {
	title: string;
	count?: number;
	children: ReactNode;
}) => (
	<section className='flex flex-col gap-2'>
		<h3 className='flex items-center gap-2 font-medium'>
			{title}
			{count !== undefined && (
				<span className='rounded-full bg-(--eds-background-non-interactive-neutral-muted) px-2 text-sm'>
					{count}
				</span>
			)}
		</h3>
		{children}
	</section>
);

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
	<div>
		<dt className='text-sm text-(color:--eds-text-secondary)'>{label}</dt>
		<dd className='wrap-break-word whitespace-pre-wrap'>{children}</dd>
	</div>
);

// Approved items look final. Others are grey until approved, and the item
// discussed in the chat is highlighted with what it still needs.
const Entry = ({ item, children }: { item: QuickStartItem; children: ReactNode }) => (
	<div
		aria-current={item.current || undefined}
		title={
			item.status === 'approved'
				? undefined
				: item.missing.length
					? `Missing: ${item.missing.join('; ')}`
					: 'To review'
		}
		className={`flex flex-col gap-1 rounded px-2 py-1 ${
			item.current
				? 'bg-primary-selected-highlight'
				: item.status !== 'approved'
					? 'opacity-60'
					: ''
		}`}
	>
		<div className='flex items-center gap-2'>
			<div className='min-w-0 flex-1'>{children}</div>
			{item.current && <AiIcon />}
		</div>
		{item.current && item.missing.length > 0 && (
			<p className='text-sm text-(color:--eds-text-secondary)'>
				Missing: {item.missing.join('; ')}
			</p>
		)}
	</div>
);

const Name = ({ item }: { item: QuickStartItem }) => (
	<span className={`wrap-break-word ${item.status === 'missing' ? dashed : ''}`}>
		{String(item.value.name)}
	</span>
);

const List = ({ items }: { items: QuickStartItem[] }) => (
	<ul>
		{items.map(item => (
			<li key={item.path}>
				<Entry item={item}>
					<Name item={item} />
				</Entry>
			</li>
		))}
	</ul>
);

export const QuickStartPanel = ({
	response,
	canCreate,
	isCreating,
	creationError,
	onCreate,
}: {
	response: QuickStartResponse;
	canCreate: boolean;
	isCreating: boolean;
	creationError: Error | null;
	onCreate: () => void;
}) => {
	const { issues: approvedIssues, diagram } = getApprovedItems(response.state);
	const inSection = (prefix: string) =>
		response.items.filter(item => item.path.startsWith(prefix));
	const project = inSection('project_information')[0];
	const objectives = inSection('objectives.');
	const untypedObjectives = objectives.filter(item => !item.value.type);
	const issues = inSection('issues.');
	const strategies = inSection('strategies.');
	const suggestion =
		response.pending?.kind === 'influence_diagram' ? response.pending.item : undefined;
	const diagramIssues = approvedIssues.filter(isDiagramIssue);
	return (
		<div className='flex flex-1 flex-col gap-6 overflow-y-auto p-6'>
			<div className='flex items-start justify-between gap-4'>
				<div>
					<h2 className='text-xl font-medium'>Project setup</h2>
					<p className='text-(color:--eds-text-secondary)'>
						Drafted from your description. Grey items are not approved yet, and{' '}
						<span className={dashed}>underlined</span> items still need details.
					</p>
				</div>
				<Button onClick={onCreate} disabled={!canCreate || isCreating}>
					{isCreating ? 'Creating project...' : 'Create project'}
				</Button>
			</div>
			{creationError && (
				<p role='alert'>
					Some parts could not be created. {creationError.message} Click Create project
					again to retry; parts that were already created are not duplicated.
				</p>
			)}
			<div className='flex flex-col gap-8 rounded border border-(color:--eds-border-non-interactive-neutral-muted) bg-(--eds-background-surface) p-6'>
				<Section title='Project'>
					{project ? (
						<Entry item={project}>
							<dl className='grid grid-cols-1 gap-3 md:grid-cols-3'>
								<Field label='Name'>
									{(project.value.project_name as string | null) ?? missingValue}
								</Field>
								<Field label='End date'>
									{project.value.end_date
										? format(
												parseISO(String(project.value.end_date)),
												'dd/MM/yyyy',
											)
										: 'Not set'}
								</Field>
								<Field label='Visibility'>
									{project.value.public_project ? 'Public' : 'Private'}
								</Field>
								<div className='md:col-span-3'>
									<Field label='Opportunity statement'>
										{(project.value.opportunity_statement as string | null) ??
											missingValue}
									</Field>
								</div>
							</dl>
						</Entry>
					) : (
						notDiscussed
					)}
				</Section>
				<Section title='Objectives' count={objectives.length}>
					{objectives.length ? (
						<>
							<div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
								{objectiveTypes.map(type => (
									<div key={type}>
										<h4 className='text-sm text-(color:--eds-text-secondary)'>
											{type}
										</h4>
										<List
											items={objectives.filter(
												item =>
													(item.value.type as ObjectiveType | null) ===
													type,
											)}
										/>
									</div>
								))}
							</div>
							{untypedObjectives.length > 0 && (
								<div>
									<h4 className='text-sm text-(color:--eds-text-secondary)'>
										Type not set yet
									</h4>
									<List items={untypedObjectives} />
								</div>
							)}
						</>
					) : (
						notDiscussed
					)}
				</Section>
				<Section title='Issues' count={issues.length}>
					{issues.length ? (
						<ul className='grid grid-cols-1 gap-x-6 md:grid-cols-2'>
							{issues.map(item => {
								const type = item.value.type as IssueType | null;
								return (
									<li key={item.path}>
										<Entry item={item}>
											<span className='flex items-center gap-2'>
												{type ? (
													<IssueTypeLabel type={type} />
												) : (
													<span className='rounded border border-dashed px-1 text-sm'>
														Type?
													</span>
												)}
												<Name item={item} />
											</span>
										</Entry>
									</li>
								);
							})}
						</ul>
					) : (
						notDiscussed
					)}
				</Section>
				<Section title='Strategies' count={strategies.length}>
					{strategies.length ? <List items={strategies} /> : notDiscussed}
				</Section>
				<Section title='Influence diagram'>
					{diagramIssues.length ? (
						<>
							{suggestion && (
								<p className='text-sm text-(color:--eds-text-secondary)'>
									Suggested connections are dashed. Approve or correct them in the
									chat.
								</p>
							)}
							<QuickStartDiagram
								issues={diagramIssues}
								edges={(suggestion ?? diagram)?.edges ?? []}
								suggested={!!suggestion}
							/>
						</>
					) : (
						notDiscussed
					)}
				</Section>
			</div>
		</div>
	);
};
