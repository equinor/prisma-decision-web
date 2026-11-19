import { Button, CircularProgress, Dialog, Icon } from '@equinor/eds-core-react';
import { close, send } from '@equinor/eds-icons';
import { format, parseISO } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import { useCreateQuickStartProject } from '../../../hooks/api/useCreateQuickStartProject';
import { useGetOpeningQuestion } from '../../../hooks/api/useGetOpeningQuestion';
import { useSendQuickStartMessage } from '../../../hooks/api/useQuickStart';
import { getChatErrorMessage } from '../../../hooks/api/useSendChatMessage';
import { getDefaultProjectValues } from '../../../utils/projectDefaults';
import {
	getQuickStartRecords,
	type QuickStartRecords,
	type QuickStartResponse,
	type QuickStartReview,
} from '../../../utils/quickStart';
import { AiIcon } from '../AiIcon';
import { ChatItemReview, ReviewField } from '../../ChatItemReview';
import { QuickStartPanel } from './QuickStartPanel';

type Message = { id: number; role: 'user' | 'assistant'; text: string };

const reviewHint =
	'If something is wrong, describe the corrections in the chat and I will fix it. Nothing is created until you click Create project at the end.';

export const QuickStart = () => {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button variant='outlined' onClick={() => setOpen(true)}>
				<AiIcon />
				Quick start
			</Button>
			{open && <QuickStartWindow onClose={() => setOpen(false)} />}
		</>
	);
};

const QuickStartWindow = ({ onClose }: { onClose: () => void }) => {
	const {
		data: openingQuestion,
		isFetching: isLoadingQuestion,
		isError: questionFailed,
		refetch: retryQuestion,
	} = useGetOpeningQuestion('quick-start', true);
	const {
		mutate: submit,
		isPending: isSending,
		isError: sendingFailed,
		error: sendingError,
	} = useSendQuickStartMessage();
	const {
		mutate: createProject,
		isPending: isCreating,
		error: creationError,
	} = useCreateQuickStartProject();
	const [projectDefaults] = useState(getDefaultProjectValues);
	const [response, setResponse] = useState<QuickStartResponse | null>(null);
	const [records, setRecords] = useState<QuickStartRecords | null>(null);
	const [resultInvalid, setResultInvalid] = useState(false);
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState('');
	const nextId = useRef(0);
	const busyRef = useRef(false);
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const bottomRef = useRef<HTMLDivElement>(null);
	const isBusy = isSending || isCreating;
	const chatDisabled = isBusy || !openingQuestion;
	const hasUnsentInput = !!input.trim();
	const conversation: Message[] = openingQuestion
		? [{ id: -1, role: 'assistant', text: openingQuestion }, ...messages]
		: messages;

	useEffect(() => {
		if (!chatDisabled) inputRef.current?.focus();
	}, [chatDisabled]);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages, response, isSending]);

	const addMessage = (role: Message['role'], text: string) => {
		const id = nextId.current++;
		setMessages(prev => [...prev, { id, role, text }]);
		return id;
	};

	const accept = (next: QuickStartResponse) => {
		setResponse(next);
		setResultInvalid(false);
		setRecords(null);
		if (next.complete) {
			try {
				setRecords(getQuickStartRecords(next, projectDefaults));
			} catch {
				setResultInvalid(true);
			}
		}
		addMessage('assistant', next.reply);
	};

	const sendMessage = (message = input) => {
		const text = message.trim();
		if (!text || busyRef.current || chatDisabled) return;
		busyRef.current = true;
		const id = addMessage('user', text);
		setInput('');
		submit(
			{ state: response?.state ?? null, action: 'answer', message: text },
			{
				onSuccess: accept,
				onError: () => {
					setMessages(prev => prev.filter(item => item.id !== id));
					setInput(text);
				},
				onSettled: () => {
					busyRef.current = false;
				},
			},
		);
	};

	const approve = () => {
		if (!response?.pending || busyRef.current || hasUnsentInput) return;
		busyRef.current = true;
		submit(
			{ state: response.state, action: 'confirm', path: response.pending.path },
			{
				onSuccess: next => {
					addMessage('user', 'Looks right');
					accept(next);
				},
				onSettled: () => {
					busyRef.current = false;
				},
			},
		);
	};

	const requestClose = () => {
		if (isCreating) return;
		if (
			messages.length &&
			!window.confirm(
				'Close Quick start? Nothing has been created yet, and your answers will be lost.',
			)
		)
			return;
		onClose();
	};

	const hasPanel = !!response;

	return (
		<Dialog
			open
			isDismissable
			onClose={requestClose}
			className='fixed inset-0 flex! h-dvh w-dvw! max-w-none! translate-none flex-col gap-0! overflow-hidden rounded-none! bg-(--eds-background-canvas)! font-normal!'
		>
			<header className='flex items-center justify-between gap-4 border-b border-(color:--eds-border-non-interactive-neutral-muted) px-6 py-3'>
				<div className='flex items-center gap-2'>
					<AiIcon />
					<div>
						<h2 id='eds-dialog-title' className='text-lg font-semibold'>
							Quick start
						</h2>
						<p className='text-sm text-(color:--eds-text-secondary)'>
							Describe your project and the assistant builds it with you.
						</p>
					</div>
				</div>
				<Button
					variant='ghost_icon'
					onClick={requestClose}
					aria-label='Close Quick start'
					disabled={isCreating}
				>
					<Icon data={close} />
				</Button>
			</header>

			<div className='flex min-h-0 flex-1'>
				<div
					className={`flex min-h-0 flex-col ${hasPanel ? 'w-110 shrink-0 border-r border-(color:--eds-border-non-interactive-neutral-muted)' : 'flex-1'}`}
				>
					<div className='flex-1 overflow-y-auto px-6 py-6'>
						<div className='mx-auto flex w-full max-w-3xl flex-col gap-4'>
							{isLoadingQuestion && (
								<p role='status' className='text-sm opacity-60'>
									Loading...
								</p>
							)}
							{questionFailed && (
								<div className='flex flex-col items-start gap-2'>
									<p role='alert' className='text-sm'>
										Could not reach the AI. Make sure the local Python API is
										running on port 8000, then try again.
									</p>
									<Button
										onClick={() => void retryQuestion()}
										disabled={isLoadingQuestion}
									>
										Try again
									</Button>
								</div>
							)}
							{conversation.map(message =>
								message.role === 'user' ? (
									<div
										key={message.id}
										className='bg-background-medium max-w-[80%] self-end rounded-2xl px-4 py-2 whitespace-pre-wrap'
									>
										{message.text}
									</div>
								) : (
									<div
										key={message.id}
										className='flex max-w-[90%] gap-3 self-start'
									>
										<span className='mt-0.5 shrink-0' aria-hidden>
											<AiIcon />
										</span>
										<p className='whitespace-pre-wrap'>{message.text}</p>
									</div>
								),
							)}
							{isSending && (
								<p
									role='status'
									className='flex items-center gap-2 text-sm opacity-60'
								>
									<CircularProgress size={16} /> The assistant is thinking...
								</p>
							)}
							{sendingFailed && (
								<p role='alert' className='text-sm'>
									{getChatErrorMessage(sendingError)} Your previous answers are
									kept.
								</p>
							)}
							{response?.pending && !isSending && (
								<PendingReview
									review={response.pending}
									busy={isBusy}
									hasUnsentInput={hasUnsentInput}
									onApprove={approve}
								/>
							)}
							{!response?.pending &&
								!isSending &&
								response?.shortcuts.map(shortcut => (
									<Button
										key={shortcut.label}
										className='self-start'
										variant='outlined'
										onClick={() => sendMessage(shortcut.message)}
										disabled={isBusy || hasUnsentInput}
									>
										{shortcut.label}
									</Button>
								))}
							{resultInvalid && (
								<p role='alert' className='text-sm'>
									The collected information is incomplete, so the project cannot
									be created. Close Quick start and try again.
								</p>
							)}
							<div ref={bottomRef} />
						</div>
					</div>

					<form
						className='border-t border-(color:--eds-border-non-interactive-neutral-muted) px-6 py-4'
						onSubmit={e => {
							e.preventDefault();
							sendMessage();
						}}
					>
						<div className='mx-auto flex w-full max-w-3xl items-end gap-2 rounded-2xl border border-(color:--eds-border-non-interactive-neutral-muted) bg-(--eds-background-input) px-4 py-2'>
							<textarea
								ref={inputRef}
								value={input}
								onChange={e => setInput(e.target.value)}
								onKeyDown={e => {
									if (e.key === 'Enter' && !e.shiftKey) {
										e.preventDefault();
										sendMessage();
									}
								}}
								rows={3}
								disabled={chatDisabled}
								placeholder={
									response?.pending
										? 'Describe a correction, or click Looks right...'
										: response?.complete
											? 'Ask a question or request a change...'
											: 'Describe your project, objectives, issues...'
								}
								aria-label='Quick start message'
								className='min-w-0 flex-1 resize-none bg-transparent p-1 outline-none'
							/>
							<Button
								type='submit'
								variant='ghost_icon'
								disabled={!hasUnsentInput || chatDisabled}
								aria-label='Send message'
							>
								<Icon data={send} />
							</Button>
						</div>
					</form>
				</div>
				{hasPanel && (
					<QuickStartPanel
						response={response}
						canCreate={!!records}
						isCreating={isCreating}
						creationError={creationError}
						onCreate={() => records && createProject(records)}
					/>
				)}
			</div>
		</Dialog>
	);
};

const PendingReview = ({
	review,
	busy,
	hasUnsentInput,
	onApprove,
}: {
	review: QuickStartReview;
	busy: boolean;
	hasUnsentInput: boolean;
	onApprove: () => void;
}) => {
	if (review.kind !== 'project' && review.kind !== 'probability_table')
		return (
			<ChatItemReview
				review={review}
				busy={busy}
				hasUnsentInput={hasUnsentInput}
				onSave={onApprove}
				approveLabel='Looks right'
				hint={reviewHint}
				diagramShownElsewhere
			/>
		);
	return (
		<section
			aria-label={review.kind === 'project' ? 'Review project' : 'Review probabilities'}
			className='border-background-medium flex flex-col gap-3 rounded border p-3 text-sm'
		>
			{review.kind === 'project' ? (
				<>
					<h3 className='font-medium'>Review your project information</h3>
					<dl className='flex flex-col gap-2'>
						<ReviewField label='Name'>{review.item.project_name}</ReviewField>
						<ReviewField label='Opportunity statement'>
							{review.item.opportunity_statement}
						</ReviewField>
						<ReviewField label='End date'>
							{review.item.end_date
								? format(parseISO(review.item.end_date), 'MM/dd/yyyy (d MMMM yyyy)')
								: 'Not given (default: 30 days from when Quick start was opened)'}
						</ReviewField>
						<ReviewField label='Visibility'>
							{review.item.public_project
								? 'Public (visible to other users)'
								: 'Private (default unless you ask for public)'}
						</ReviewField>
					</dl>
				</>
			) : (
				<>
					<h3 className='font-medium'>Review the probabilities for {review.item.name}</h3>
					<ProbabilityTable rows={review.item.rows} />
				</>
			)}
			{review.note && <p className='whitespace-pre-wrap'>{review.note}</p>}
			<p>{reviewHint}</p>
			{hasUnsentInput && <p>Send or clear your message first.</p>}
			<Button className='self-start' onClick={onApprove} disabled={busy || hasUnsentInput}>
				{busy ? 'Please wait...' : 'Looks right'}
			</Button>
		</section>
	);
};

const ProbabilityTable = ({
	rows,
}: {
	rows: Extract<QuickStartReview, { kind: 'probability_table' }>['item']['rows'];
}) => {
	const when = (row: (typeof rows)[number]) =>
		row.parent_states.map(s => `${s.issue_name} = ${s.state_name}`).join(', ');
	const outcomes = [...new Set(rows.map(row => row.outcome_name))];
	const combinations = [...new Set(rows.map(when))];
	return (
		<table className='text-left'>
			<thead>
				<tr>
					<th>When</th>
					{outcomes.map(outcome => (
						<th key={outcome}>{outcome}</th>
					))}
				</tr>
			</thead>
			<tbody>
				{combinations.map(combination => (
					<tr key={combination}>
						<td>{combination || 'Always'}</td>
						{outcomes.map(outcome => {
							const row = rows.find(
								r => when(r) === combination && r.outcome_name === outcome,
							);
							return (
								<td key={outcome}>
									{row && `${Math.round(row.probability * 100)}%`}
								</td>
							);
						})}
					</tr>
				))}
			</tbody>
		</table>
	);
};
