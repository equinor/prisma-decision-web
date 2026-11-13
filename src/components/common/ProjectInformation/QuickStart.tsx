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

type Message = { id: number; role: 'user' | 'assistant'; text: string };

const reviewHint =
	'Describe any corrections in the chat. Nothing is created until you click Create project at the end.';

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
	const chatDisabled = isBusy || !openingQuestion || !!response?.complete;
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

	const progress = response?.progress;

	return (
		<Dialog
			open
			isDismissable
			onClose={requestClose}
			className='fixed top-1/2 left-1/2 flex! h-[min(900px,92vh)] w-[min(1000px,95vw)]! -translate-x-1/2 -translate-y-1/2 flex-col gap-0! overflow-hidden font-normal!'
		>
			<header className='border-background-medium flex items-center justify-between gap-4 border-b px-6 py-3'>
				<div className='flex items-center gap-2'>
					<AiIcon />
					<div>
						<h2 id='eds-dialog-title' className='text-lg font-semibold'>
							Quick start
						</h2>
						<p className='text-text-tertiary text-sm'>
							Describe your project and the assistant builds it with you.
						</p>
					</div>
				</div>
				<div className='flex items-center gap-2'>
					<ul aria-label='Approved so far' className='flex flex-wrap gap-2 text-xs'>
						<ProgressChip
							label='Project'
							value={progress?.project_information ? '✓' : '–'}
						/>
						<ProgressChip label='Objectives' value={progress?.objectives ?? 0} />
						<ProgressChip label='Issues' value={progress?.issues ?? 0} />
						<ProgressChip
							label='Strategies'
							value={progress?.strategies ?? 0}
							optional
						/>
						<ProgressChip
							label='Connections'
							value={progress?.influence_connections ?? 0}
							optional
						/>
					</ul>
					<Button
						variant='ghost_icon'
						onClick={requestClose}
						aria-label='Close Quick start'
						disabled={isCreating}
					>
						<Icon data={close} />
					</Button>
				</div>
			</header>

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
								Could not reach the AI. Make sure the local Python API is running on
								port 8000, then try again.
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
							<div key={message.id} className='flex max-w-[90%] gap-3 self-start'>
								<span className='mt-0.5 shrink-0' aria-hidden>
									<AiIcon />
								</span>
								<p className='whitespace-pre-wrap'>{message.text}</p>
							</div>
						),
					)}
					{isSending && (
						<p role='status' className='flex items-center gap-2 text-sm opacity-60'>
							<CircularProgress size={16} /> The assistant is thinking...
						</p>
					)}
					{sendingFailed && (
						<p role='alert' className='text-sm'>
							{getChatErrorMessage(sendingError)} Your previous answers are kept.
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
					{response?.shortcut && !response.pending && !isSending && (
						<Button
							className='self-start'
							variant='outlined'
							onClick={() => sendMessage(response.shortcut?.message)}
							disabled={isBusy || hasUnsentInput}
						>
							{response.shortcut.label}
						</Button>
					)}
					{resultInvalid && (
						<p role='alert' className='text-sm'>
							The collected information is incomplete, so the project cannot be
							created. Close Quick start and try again.
						</p>
					)}
					{records && (
						<section
							aria-label='Create project'
							className='border-background-medium flex flex-col gap-3 rounded border p-4 text-sm'
						>
							<h3 className='text-base font-medium'>
								Ready to create “{records.project.name}”
							</h3>
							<ul className='list-inside list-disc'>
								<li>
									End date:{' '}
									{format(
										new Date(records.project.end_date),
										'MM/dd/yyyy (d MMMM yyyy)',
									)}
								</li>
								<li>Visibility: {records.project.public ? 'Public' : 'Private'}</li>
								<li>{records.objectives.length} objective(s)</li>
								<li>{records.issues.length} issue(s)</li>
								<li>{records.strategies.length} strategy(ies)</li>
								<li>{records.diagram.edges.length} influence connection(s)</li>
							</ul>
							<Button
								className='self-start'
								onClick={() => createProject(records)}
								disabled={isCreating}
							>
								{isCreating ? 'Creating project...' : 'Create project'}
							</Button>
							{creationError && (
								<p role='alert'>
									Some parts could not be created. {creationError.message} Click
									Create project again to retry; parts that were already created
									are not duplicated.
								</p>
							)}
						</section>
					)}
					<div ref={bottomRef} />
				</div>
			</div>

			<form
				className='border-background-medium border-t px-6 py-4'
				onSubmit={e => {
					e.preventDefault();
					sendMessage();
				}}
			>
				<div className='border-background-medium mx-auto flex w-full max-w-3xl items-end gap-2 rounded-2xl border px-4 py-2'>
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
							response?.complete
								? 'Everything is approved'
								: response?.pending
									? 'Describe a correction, or click Looks right...'
									: 'Describe your project, objectives, issues...'
						}
						aria-label='Quick start message'
						className='bg-background-default min-w-0 flex-1 resize-none p-1 outline-none'
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
		</Dialog>
	);
};

const ProgressChip = ({
	label,
	value,
	optional = false,
}: {
	label: string;
	value: number | string;
	optional?: boolean;
}) => (
	<li
		className='bg-background-light rounded-full px-2 py-1'
		title={optional ? 'Optional' : undefined}
	>
		{label}: {value}
		{optional && <span className='opacity-60'> (optional)</span>}
	</li>
);

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
	if (review.kind !== 'project')
		return (
			<ChatItemReview
				review={review}
				busy={busy}
				hasUnsentInput={hasUnsentInput}
				onSave={onApprove}
				approveLabel='Looks right'
				hint={reviewHint}
			/>
		);
	return (
		<section
			aria-label='Review project'
			className='border-background-medium flex flex-col gap-3 rounded border p-3 text-sm'
		>
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
			{review.note && <p>{review.note}</p>}
			<p>{reviewHint}</p>
			{hasUnsentInput && <p>Send or clear your message first.</p>}
			<Button className='self-start' onClick={onApprove} disabled={busy || hasUnsentInput}>
				{busy ? 'Please wait...' : 'Looks right'}
			</Button>
		</section>
	);
};
