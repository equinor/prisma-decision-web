import { Button } from '@equinor/eds-core-react';
import type { ReactNode } from 'react';
import type { ChatReview } from '../utils/chatInterview';
import type { ChatDiagram } from '../utils/diagramInformation';

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

type ChatItemReviewProps = {
	review: DistributiveOmit<ChatReview, 'path' | 'original' | 'original_name'>;
	saved?: boolean;
	busy: boolean;
	hasUnsentInput: boolean;
	onSave: () => void;
	error?: Error | null;
	approveLabel?: string;
	hint?: string;
};

const boundaryText = { in: 'In scope', on: 'On the boundary', out: 'Out of scope' };

const whenStates = (states: ChatDiagram['discrete_utilities'][number]['parent_states']) =>
	states.length ? ` when ${states.map(s => `${s.issue_name} = ${s.state_name}`).join(', ')}` : '';

export const ReviewField = ({ label, children }: { label: string; children: ReactNode }) => (
	<div>
		<dt className='font-medium'>{label}</dt>
		<dd className='wrap-break-word whitespace-pre-wrap'>{children}</dd>
	</div>
);

export const ChatItemReview = ({
	review,
	saved = false,
	busy,
	hasUnsentInput,
	onSave,
	error,
	approveLabel = review.kind === 'influence_diagram'
		? 'Save diagram changes'
		: `Save ${review.kind}`,
	hint = 'Send any corrections before saving. Each item is saved only after you approve it.',
}: ChatItemReviewProps) => (
	<section
		aria-label={`Review ${review.kind}`}
		className='border-background-medium flex flex-col gap-3 rounded border p-3 text-sm'
	>
		<h3 className='font-medium'>
			Review your {review.kind === 'influence_diagram' ? 'influence diagram' : review.kind}
		</h3>
		{review.kind === 'influence_diagram' ? (
			<div className='flex flex-col gap-2'>
				<p>Proposed connections (removed connections will no longer appear):</p>
				<ul>
					{review.item.edges.map((edge, index) => (
						<li key={index}>
							{edge.tail_issue_name} {'->'} {edge.head_issue_name}
						</li>
					))}
				</ul>
				{!review.item.edges.length && <p>No connections.</p>}
				<p>Probabilities:</p>
				<ul>
					{review.item.discrete_probabilities.map((row, index) => (
						<li key={index}>
							{row.uncertainty_name} / {row.outcome_name}: {row.probability}
							{whenStates(row.parent_states)}
						</li>
					))}
				</ul>
				<p>Utility values:</p>
				<ul>
					{review.item.discrete_utilities.map((row, index) => (
						<li key={index}>
							{row.utility_name}: {row.utility_value}
							{whenStates(row.parent_states)}
						</li>
					))}
				</ul>
			</div>
		) : (
			<dl className='flex flex-col gap-2'>
				<ReviewField label='Name'>{review.item.name}</ReviewField>
				{review.kind !== 'strategy' && (
					<ReviewField label='Type'>{review.item.type}</ReviewField>
				)}
				{review.item.description && (
					<ReviewField label='Description'>{review.item.description}</ReviewField>
				)}
				{review.kind === 'strategy' && (
					<>
						<ReviewField label='Rationale'>{review.item.rationale}</ReviewField>
						<ReviewField label='Selected options'>
							{review.item.options.length ? (
								<ul>
									{review.item.options.map(option => (
										<li key={option.decision_name}>
											{option.decision_name}: {option.option_name}
										</li>
									))}
								</ul>
							) : (
								'No in-scope Focus decisions require an option.'
							)}
						</ReviewField>
					</>
				)}
				{review.kind === 'issue' && (
					<>
						<ReviewField label='Boundary'>
							{boundaryText[review.item.boundary]}
						</ReviewField>
						{review.item.type === 'Decision' && review.item.decision && (
							<>
								<ReviewField label='Decision type'>
									{review.item.decision.type}
								</ReviewField>
								<ReviewField label='Options'>
									<ul>
										{review.item.decision.options.map(option => (
											<li key={option.name}>
												{option.name}: utility {option.utility}
											</li>
										))}
									</ul>
								</ReviewField>
							</>
						)}
						{review.item.type === 'Uncertainty' && review.item.uncertainty && (
							<>
								<ReviewField label='Key uncertainty'>
									{review.item.uncertainty.is_key ? 'Yes' : 'No'}
								</ReviewField>
								<ReviewField label='Outcomes'>
									<ul>
										{review.item.uncertainty.outcomes.map(outcome => (
											<li key={outcome.name}>
												{outcome.name}: utility {outcome.utility}
											</li>
										))}
									</ul>
								</ReviewField>
							</>
						)}
					</>
				)}
			</dl>
		)}
		{review.note && <p>{review.note}</p>}
		{saved ? (
			<p role='status'>
				Saved. Continue to get the next question; this will not save it again.
			</p>
		) : (
			<p>{hint}</p>
		)}
		{hasUnsentInput && <p>Send or clear your message first.</p>}
		<Button onClick={onSave} disabled={busy || hasUnsentInput}>
			{busy ? 'Please wait...' : saved ? 'Continue' : approveLabel}
		</Button>
		{error && (
			<p role='alert'>
				Could not confirm the save. {error.message} Your draft is still here.
			</p>
		)}
	</section>
);
