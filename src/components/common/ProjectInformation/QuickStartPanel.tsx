import { Button } from '@equinor/eds-core-react';
import { format, parseISO } from 'date-fns';
import type { ReactNode } from 'react';
import {
	getApprovedItems,
	isDiagramIssue,
	type QuickStartResponse,
} from '../../../utils/quickStart';
import { objectiveTypes } from '../../../validators';
import { IssueTypeLabel } from '../Cards/IssueTypeLabel';
import { QuickStartDiagram } from './QuickStartDiagram';

const notDiscussed = <p className='text-(color:--eds-text-secondary)'>Not discussed yet</p>;

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
	const { project, objectives, issues, strategies, diagram } = getApprovedItems(response.state);
	const suggestion =
		response.pending?.kind === 'influence_diagram' ? response.pending.item : undefined;
	const diagramIssues = issues.filter(isDiagramIssue);
	return (
		<div className='flex flex-1 flex-col gap-6 overflow-y-auto p-6'>
			<div className='flex items-start justify-between gap-4'>
				<div>
					<h2 className='text-xl font-medium'>Project setup</h2>
					<p className='text-(color:--eds-text-secondary)'>
						Filled in as you approve items in the chat.
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
						<dl className='grid grid-cols-1 gap-3 md:grid-cols-3'>
							<Field label='Name'>{project.project_name}</Field>
							<Field label='End date'>
								{project.end_date
									? format(parseISO(project.end_date), 'dd/MM/yyyy')
									: 'Not set'}
							</Field>
							<Field label='Visibility'>
								{project.public_project ? 'Public' : 'Private'}
							</Field>
							<div className='md:col-span-3'>
								<Field label='Opportunity statement'>
									{project.opportunity_statement}
								</Field>
							</div>
						</dl>
					) : (
						notDiscussed
					)}
				</Section>
				<Section title='Objectives' count={objectives.length}>
					{objectives.length ? (
						<div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
							{objectiveTypes.map(type => (
								<div key={type}>
									<h4 className='text-sm text-(color:--eds-text-secondary)'>
										{type}
									</h4>
									<ul>
										{objectives
											.filter(objective => objective.type === type)
											.map(objective => (
												<li key={objective.name}>{objective.name}</li>
											))}
									</ul>
								</div>
							))}
						</div>
					) : (
						notDiscussed
					)}
				</Section>
				<Section title='Issues' count={issues.length}>
					{issues.length ? (
						<ul className='grid grid-cols-1 gap-x-6 gap-y-2 md:grid-cols-2'>
							{issues.map(issue => (
								<li key={issue.name} className='flex items-center gap-2'>
									<IssueTypeLabel type={issue.type} />
									{issue.name}
								</li>
							))}
						</ul>
					) : (
						notDiscussed
					)}
				</Section>
				<Section title='Strategies' count={strategies.length}>
					{strategies.length ? (
						<ul>
							{strategies.map(strategy => (
								<li key={strategy.name}>{strategy.name}</li>
							))}
						</ul>
					) : (
						notDiscussed
					)}
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
