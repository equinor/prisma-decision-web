import { Button, Icon } from '@equinor/eds-core-react';
import { close, send } from '@equinor/eds-icons';
import { format } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { useGetOpeningQuestion } from '../hooks/api/useGetOpeningQuestion';
import {
	ChatIntakeResponse,
	getChatErrorMessage,
	useSendChatMessage,
} from '../hooks/api/useSendChatMessage';
import { useCreateProject } from '../hooks/api/useCreateProject';
import { useUpdateProject } from '../hooks/api/useUpdateProject';
import { useGetProjects } from '../hooks/api/useGetProjects';
import { useGetObjectives } from '../hooks/api/useGetObjectives';
import { useGetIssues } from '../hooks/api/useGetIssues';
import { useGetStrategies } from '../hooks/api/useGetStrategies';
import { useSaveChatItem } from '../hooks/api/useSaveChatItem';
import { ChatItemReview, ReviewField } from './ChatItemReview';
import {
	getChatItemToSave,
	type ChatInterviewResponse,
	type ChatItemToSave,
} from '../utils/chatInterview';
import { getDefaultProjectValues, getProjectFromIntake } from '../utils/projectDefaults';
import { getChatPageContext } from '../utils/chatPageContext';
import { Project, projectSchema } from '../validators';

type ChatMessage = {
	id: number;
	role: 'user' | 'assistant';
	text: string;
};

type ChatPanelProps = {
	open: boolean;
	onClose: () => void;
};

const doneLabels = {
	objectives: 'Done with objectives - move to Issues',
	issues: 'Done with issues - move to Strategies',
	strategies: 'Done with strategies',
	influence_diagram: 'Done with strategies',
};

const nextStepQuestion =
	'Is there anything else you would like to change in the project information, or would you like to move to objectives?';

export const ChatPanel = ({ open, onClose }: ChatPanelProps) => {
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const { projectId: pageProjectId, currentSection } = getChatPageContext(pathname);
	const queryClient = useQueryClient();
	const {
		projects,
		isLoading: projectsLoading,
		isError: projectsFailed,
		refetch: retryProjects,
	} = useGetProjects();
	const {
		objectives,
		isLoading: objectivesLoading,
		isError: objectivesFailed,
		refetch: retryObjectives,
	} = useGetObjectives();
	const {
		issues,
		isLoading: issuesLoading,
		isError: issuesFailed,
		refetch: retryIssues,
	} = useGetIssues();
	const {
		strategies,
		isLoading: strategiesLoading,
		isError: strategiesFailed,
		refetch: retryStrategies,
	} = useGetStrategies();
	const {
		mutate: saveItem,
		isPending: isSavingItem,
		error: itemSaveError,
		reset: resetItemSave,
	} = useSaveChatItem();
	const {
		data: openingQuestion,
		isFetching: isLoadingOpeningQuestion,
		isError: openingQuestionFailed,
		refetch: retryOpeningQuestion,
	} = useGetOpeningQuestion('chat', open);
	const {
		mutate: submitMessage,
		isPending: isSending,
		isError: sendingFailed,
		error: sendingError,
	} = useSendChatMessage();
	const {
		mutate: createProject,
		isPending: isCreating,
		isError: creationFailed,
		reset: resetCreation,
	} = useCreateProject();
	const {
		mutate: updateProject,
		isPending: isUpdating,
		isError: updateFailed,
		reset: resetUpdate,
	} = useUpdateProject();
	const [projectDefaults] = useState(getDefaultProjectValues);
	const [intake, setIntake] = useState<Extract<
		ChatIntakeResponse,
		{ status: 'ready' | 'collecting' }
	> | null>(null);
	const [inNextStep, setInNextStep] = useState(false);
	const [interview, setInterview] = useState<ChatInterviewResponse | null>(null);
	const [itemToSave, setItemToSave] = useState<ChatItemToSave | null>(null);
	const [itemSaved, setItemSaved] = useState(false);
	const [projectToCreate, setProjectToCreate] = useState<Project | null>(null);
	const [createdProject, setCreatedProject] = useState<Project | null>(null);
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [input, setInput] = useState('');
	const nextId = useRef(0);
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const bottomRef = useRef<HTMLDivElement>(null);
	const busyRef = useRef(false);
	const isBusy = isSending || isCreating || isUpdating || isSavingItem;
	const contextFailed = objectivesFailed || issuesFailed || strategiesFailed;
	const contextReady =
		!objectivesLoading && !issuesLoading && !strategiesLoading && !contextFailed;
	const retryContext = () => {
		void retryObjectives();
		void retryIssues();
		void retryStrategies();
	};
	// Reads the cache so items saved earlier in the same click are included.
	const projectItems = <T extends { project_id: string }>(
		key: string,
		fallback: T[],
		projectId?: string,
	) =>
		(queryClient.getQueryData<T[]>([key]) ?? fallback).filter(
			item => item.project_id === projectId,
		);
	const savedProject =
		projects.find(project =>
			pageProjectId
				? project.id.toLowerCase() === pageProjectId.toLowerCase()
				: project.id === createdProject?.id,
		) ?? (pageProjectId ? null : createdProject);
	const activeInterview =
		interview?.state.project_id.toLowerCase() === savedProject?.id.toLowerCase()
			? interview
			: null;
	const chatDisabled =
		isBusy ||
		(!!activeInterview && itemSaved) ||
		activeInterview?.stage === 'complete' ||
		(!!pageProjectId && (!savedProject || projectsFailed)) ||
		((inNextStep || !!pageProjectId || !!activeInterview) && !contextReady);
	const initialQuestion =
		currentSection && pageProjectId
			? savedProject
				? `I can help you with ${currentSection === 'influence_diagram' ? 'the influence diagram, probabilities and utility tables' : currentSection} in "${savedProject.name}". What would you like to add, change or get help with?`
				: undefined
			: openingQuestion;
	const conversation: ChatMessage[] = initialQuestion
		? [{ id: -1, role: 'assistant', text: initialQuestion }, ...messages]
		: messages;

	useEffect(() => {
		if (open && initialQuestion && !chatDisabled) inputRef.current?.focus();
	}, [open, initialQuestion, chatDisabled]);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages, openingQuestion, projectToCreate, createdProject, interview, itemSaved]);

	const acceptInterview = (response: ChatInterviewResponse, afterSave = false) => {
		setItemToSave(
			response.pending
				? getChatItemToSave(
						response.pending,
						response.state.project_id,
						projectItems('objectives', objectives, response.state.project_id),
						projectItems('issues', issues, response.state.project_id),
						afterSave || itemSaved ? null : itemToSave,
						projectItems('strategies', strategies, response.state.project_id),
					)
				: null,
		);
		setInterview(response);
		setItemSaved(false);
		setInNextStep(false);
		setProjectToCreate(null);
		if (
			response.stage !== 'complete' &&
			response.state.mode !== 'free' &&
			(!currentSection || !activeInterview || currentSection === activeInterview.stage)
		)
			navigate(`/project/${response.state.project_id}/${response.stage}`);
	};

	const addReply = (text: string) => {
		const id = nextId.current++;
		setMessages(prev => [...prev, { id, role: 'assistant', text }]);
	};

	const sendMessage = (message = input) => {
		const text = message.trim();
		if (!text || busyRef.current || !initialQuestion || chatDisabled) return;

		busyRef.current = true;
		resetCreation();
		resetUpdate();
		resetItemSave();
		const userMessageId = nextId.current++;
		setMessages(prev => [...prev, { id: userMessageId, role: 'user', text }]);
		setInput('');
		submitMessage(
			{
				message: text,
				project_information:
					savedProject && (inNextStep || !!pageProjectId)
						? {
								project_name: savedProject.name,
								opportunity_statement: savedProject.opportunity_statement ?? null,
								end_date: format(new Date(savedProject.end_date), 'yyyy-MM-dd'),
								public_project: savedProject.public,
							}
						: intake?.project_information,
				question: messages.at(-1)?.text ?? initialQuestion,
				next_step: inNextStep && !currentSection,
				saved_project: !!savedProject,
				parked_notes: intake?.parked_notes,
				conversation_log: intake?.conversation_log,
				project_id: savedProject?.id,
				current_section: savedProject ? currentSection : undefined,
				existing_objectives: {
					objectives: projectItems('objectives', objectives, savedProject?.id),
				},
				existing_issues: { issues: projectItems('issues', issues, savedProject?.id) },
				existing_strategies: {
					strategies: projectItems('strategies', strategies, savedProject?.id),
				},
				interview: activeInterview
					? {
							state: activeInterview.state,
							action: 'answer',
							message: text,
							current_section: currentSection,
						}
					: undefined,
			},
			{
				onSuccess: response => {
					if (response.status === 'interview') {
						acceptInterview(response);
					} else if (response.status !== 'next_step') {
						setIntake(response);
						setInNextStep(false);
						setProjectToCreate(
							response.status === 'ready'
								? projectSchema.parse(
										getProjectFromIntake(
											{
												...projectDefaults,
												...savedProject,
												end_date: projectDefaults.end_date,
												public: projectDefaults.public,
											},
											response.project_information,
										),
									)
								: null,
						);
					}
					addReply(response.reply);
				},
				onError: () => {
					setMessages(prev => prev.filter(message => message.id !== userMessageId));
					setInput(text);
				},
				onSettled: () => {
					busyRef.current = false;
				},
			},
		);
	};

	const approveItem = () => {
		if (!activeInterview?.pending || !itemToSave || busyRef.current || input.trim()) return;
		busyRef.current = true;
		const advance = () =>
			submitMessage(
				{
					message: 'Item saved',
					question: messages.at(-1)?.text ?? '',
					interview: {
						state: activeInterview.state,
						action: 'confirm',
						path: itemToSave.path,
					},
				},
				{
					onSuccess: response => {
						if (response.status === 'interview') acceptInterview(response, true);
						addReply(response.reply);
					},
					onSettled: () => {
						busyRef.current = false;
					},
				},
			);
		if (itemSaved) {
			advance();
		} else {
			saveItem(itemToSave, {
				onSuccess: () => {
					setItemSaved(true);
					advance();
				},
				onError: () => {
					busyRef.current = false;
				},
			});
		}
	};

	const approveProject = () => {
		if (!projectToCreate || busyRef.current || input.trim()) return;
		busyRef.current = true;
		const saveProject = savedProject ? updateProject : createProject;
		saveProject(projectToCreate, {
			onSuccess: project => {
				setCreatedProject(project);
				setProjectToCreate(null);
				setInNextStep(true);
				addReply(nextStepQuestion);
			},
			onSettled: () => {
				busyRef.current = false;
			},
		});
	};

	return (
		<aside
			aria-label='AI assistant'
			inert={!open}
			className={`bg-background-default border-background-medium overflow-hidden transition-[width] duration-300 ease-in-out ${
				open ? 'w-[var(--chat-panel-width,24rem)] border-l' : 'w-0'
			}`}
		>
			<div className='flex h-full w-96 flex-col'>
				<div className='border-background-medium flex items-center justify-between border-b px-4 py-2'>
					<h2 className='text-base font-medium'>AI assistant</h2>
					<Button variant='ghost_icon' onClick={onClose} aria-label='Close chat'>
						<Icon data={close} />
					</Button>
				</div>
				<div className='flex flex-1 flex-col gap-3 overflow-y-auto p-4'>
					{pageProjectId && (projectsLoading || !contextReady) && (
						<p role='status' className='text-sm'>
							Loading the saved project information for chat...
						</p>
					)}
					{pageProjectId &&
						(projectsFailed ||
							(!projectsLoading && !savedProject) ||
							contextFailed) && (
							<div role='alert' className='flex flex-col items-start gap-2 text-sm'>
								<p>
									Could not load this project&apos;s chat context. Please retry.
								</p>
								<Button
									onClick={() => {
										void retryProjects();
										retryContext();
									}}
								>
									Retry loading project
								</Button>
							</div>
						)}
					{!currentSection && isLoadingOpeningQuestion && (
						<p role='status' className='text-sm opacity-60'>
							Loading the opening question...
						</p>
					)}
					{!currentSection && openingQuestionFailed && (
						<div className='flex flex-col items-start gap-2'>
							<p role='alert' className='text-sm'>
								Could not load the opening question. Make sure the local Python API
								is running on port 8000, then try again.
							</p>
							<Button
								onClick={() => void retryOpeningQuestion()}
								disabled={isLoadingOpeningQuestion}
							>
								Try again
							</Button>
						</div>
					)}
					{conversation.map(message => (
						<div
							key={message.id}
							className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
								message.role === 'user'
									? 'bg-background-medium self-end'
									: 'bg-background-light self-start'
							}`}
						>
							{message.text}
						</div>
					))}
					{isSending && (
						<p role='status' className='text-sm opacity-60'>
							AI is processing your message...
						</p>
					)}
					{sendingFailed && (
						<p role='alert' className='text-sm'>
							{getChatErrorMessage(sendingError)}{' '}
							{itemSaved
								? 'Your item is saved. Click Continue to retry the next question.'
								: 'Your text has been restored.'}
						</p>
					)}
					{activeInterview?.pending && (
						<ChatItemReview
							review={activeInterview.pending}
							saved={itemSaved}
							busy={isBusy}
							hasUnsentInput={!!input.trim()}
							onSave={approveItem}
							error={itemSaveError}
						/>
					)}
					{activeInterview &&
						activeInterview.stage !== 'complete' &&
						activeInterview.can_finish &&
						(!currentSection || currentSection === activeInterview.stage) && (
							<div className='flex flex-wrap gap-2'>
								<Button
									onClick={() => sendMessage(`No more ${activeInterview.stage}`)}
									disabled={isBusy || !!input.trim()}
								>
									{doneLabels[activeInterview.stage]}
								</Button>
								{activeInterview.stage === 'issues' && (
									<Button
										variant='outlined'
										onClick={() =>
											navigate(
												`/project/${activeInterview.state.project_id}/influence-diagram`,
											)
										}
										disabled={isBusy || !!input.trim()}
									>
										Skip strategies - go to Influence Diagram
									</Button>
								)}
							</div>
						)}
					{projectToCreate && (
						<section
							aria-label='Review project'
							className='border-background-medium flex flex-col gap-3 rounded border p-3 text-sm'
						>
							<h3 className='font-medium'>
								{savedProject
									? 'Review project changes'
									: 'Review your new project'}
							</h3>
							<dl className='flex flex-col gap-2'>
								<ReviewField label='Name'>{projectToCreate.name}</ReviewField>
								<ReviewField label='Opportunity statement'>
									{projectToCreate.opportunity_statement}
								</ReviewField>
								<ReviewField label='End date'>
									{format(
										new Date(projectToCreate.end_date),
										'MM/dd/yyyy (d MMMM yyyy)',
									)}
									{!intake?.project_information.end_date && (
										<span>
											{' '}
											(default: 30 days from when this chat was initialized)
										</span>
									)}
								</ReviewField>
								<ReviewField label='Visibility'>
									{projectToCreate.public ? 'Public' : 'Private'}
									{intake?.project_information.public_project === null && (
										<span> (default: private when not specified)</span>
									)}
								</ReviewField>
							</dl>
							{projectToCreate.public && (
								<p>This project will be public and visible to other users.</p>
							)}
							<p>
								Dates use month/day/year (MM/DD/YYYY). Send a message to change
								these details before approving.
							</p>
							{input.trim() && <p>Send your changes before creating the project.</p>}
							<Button onClick={approveProject} disabled={isBusy || !!input.trim()}>
								{isCreating
									? 'Creating project...'
									: isUpdating
										? 'Saving changes...'
										: savedProject
											? 'Save changes'
											: 'Create project'}
							</Button>
							{(creationFailed || updateFailed) && (
								<p role='alert'>
									Could not save the project. Your details are still here. Check
									the Prisma backend connection, then try again.
								</p>
							)}
						</section>
					)}
					{createdProject && (
						<div className='flex flex-col items-start gap-2 text-sm'>
							<p role='status'>Project &quot;{createdProject.name}&quot; is saved.</p>
							{inNextStep && (
								<>
									{contextFailed && (
										<div role='alert'>
											<p>
												Could not load the existing objectives, issues and
												strategies.
											</p>
											<Button onClick={retryContext}>
												Retry loading items
											</Button>
										</div>
									)}
									<Button
										onClick={() => sendMessage('Move to objectives')}
										disabled={isBusy || !!input.trim() || !contextReady}
									>
										Move to Objectives
									</Button>
									{input.trim() && (
										<p>
											Send or clear your message before moving to objectives.
										</p>
									)}
								</>
							)}
						</div>
					)}
					<div ref={bottomRef} />
				</div>
				<form
					className='border-background-medium flex items-end gap-2 border-t p-3'
					onSubmit={e => {
						e.preventDefault();
						sendMessage();
					}}
				>
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
						rows={2}
						disabled={!initialQuestion || chatDisabled}
						placeholder={
							activeInterview?.stage === 'complete'
								? 'Objectives, issues and strategies are complete'
								: currentSection || activeInterview
									? 'What would you like to add or change here?'
									: inNextStep
										? 'Describe a change or say move to objectives...'
										: 'Describe your project...'
						}
						aria-label='Chat message'
						className='border-background-medium bg-background-default min-w-0 flex-1 resize-none rounded border p-2 text-sm'
					/>
					<Button
						type='submit'
						variant='ghost_icon'
						disabled={!input.trim() || chatDisabled || !initialQuestion}
						aria-label='Send message'
					>
						<Icon data={send} />
					</Button>
				</form>
			</div>
		</aside>
	);
};
