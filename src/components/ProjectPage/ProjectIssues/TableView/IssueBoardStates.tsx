import { Button, Icon, TextField } from '@equinor/eds-core-react/next';
import { add, chevron_down, chevron_up, edit, remove_outlined } from '@equinor/eds-icons';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useUpdateIssue } from '../../../../hooks/api/useUpdateIssue';
import { useExpandCard } from '../../../../hooks/useExpandCard';
import { cn } from '../../../../utils/cn';
import { sortByCreatedAt } from '../../../../utils/sortByCreatedAt';
import { Issue, Option, optionSchema, Outcome, outcomeSchema } from '../../../../validators';

type Editor = {
	state: Option | Outcome;
	name: string;
	utility: string;
	field: 'name' | 'utility';
	isNew?: boolean;
};

export const IssueBoardStates = ({
	issue,
	onEditingChange,
}: {
	issue: Issue;
	onEditingChange?: (issueId: string, editing: boolean) => void;
}) => {
	const { expanded, toggle } = useExpandCard(issue.id);
	const queryClient = useQueryClient();
	const [editor, setEditor] = useState<Editor | null>(null);
	const [error, setError] = useState<string>();
	const nameRef = useRef<HTMLInputElement>(null);
	const listRef = useRef<HTMLUListElement>(null);
	const expandRef = useRef<HTMLButtonElement>(null);
	const addRef = useRef<HTMLButtonElement>(null);
	const saving = useRef(false);
	const savedUpdate = useRef<((current: Issue) => Issue) | null>(null);
	const { mutateAsync, isPending } = useUpdateIssue({
		issueId: issue.id,
		onSuccess: async () => {
			// Publish before the shared issue scope releases queued text saves.
			const update = savedUpdate.current;
			if (!update) return;
			await queryClient.cancelQueries({ queryKey: ['issues'] }, { revert: false });
			queryClient.setQueryData<Issue[]>(['issues'], issues =>
				issues?.map(current => (current.id === issue.id ? update(current) : current)),
			);
		},
	});
	const editing = editor !== null;
	useEffect(() => {
		onEditingChange?.(issue.id, editing);
		return () => onEditingChange?.(issue.id, false);
	}, [issue.id, editing, onEditingChange]);
	const states = sortByCreatedAt<Option | Outcome>(
		issue.type === 'Uncertainty' ? issue.uncertainty.outcomes : issue.decision.options,
	);
	const stateType = issue.type === 'Uncertainty' ? 'outcome' : 'option';
	const rows =
		editor?.isNew && !states.some(state => state.id === editor.state.id)
			? [...states, editor.state]
			: states;

	const startNew = async () => {
		if (saving.current) return;
		if (editor && !(await save())) return;
		const common = {
			id: crypto.randomUUID(),
			project_id: issue.project_id,
			name: '',
			utility: 0,
			created_at: new Date().toISOString(),
		};
		const state =
			issue.type === 'Uncertainty'
				? { ...common, uncertainty_id: issue.uncertainty.id }
				: { ...common, decision_id: issue.decision.id };
		setError(undefined);
		setEditor({ state, name: '', utility: '0', field: 'name', isNew: true });
		if (!expanded) toggle();
	};

	const start = async (state: Option | Outcome, field: Editor['field']) => {
		if (saving.current || editor?.state.id === state.id) return;
		if (editor && !(await save())) return;
		setError(undefined);
		setEditor({ state, name: state.name, utility: String(state.utility ?? 0), field });
	};

	const discard = () => {
		if (saving.current) return;
		setError(undefined);
		setEditor(null);
	};

	const remove = async () => {
		if (!editor || saving.current) return;
		if (editor.isNew) return discard();
		const removedId = editor.state.id;
		await persist(current =>
			issue.type === 'Uncertainty'
				? {
						...current,
						uncertainty: {
							...current.uncertainty,
							outcomes: current.uncertainty.outcomes.filter(
								state => state.id !== removedId,
							),
						},
					}
				: {
						...current,
						decision: {
							...current.decision,
							options: current.decision.options.filter(
								state => state.id !== removedId,
							),
						},
					},
		);
	};

	const save = async () => {
		if (!editor || saving.current) return false;
		const updatedState = {
			...editor.state,
			name: editor.name,
			utility: Number(editor.utility),
		};
		const schema = issue.type === 'Uncertainty' ? outcomeSchema : optionSchema;
		const result = schema.safeParse(updatedState);
		if (!result.success) {
			setError(result.error.issues[0].message);
			nameRef.current?.focus();
			return false;
		}
		setError(undefined);
		if (
			!editor.isNew &&
			updatedState.name === editor.state.name &&
			updatedState.utility === (editor.state.utility ?? 0)
		) {
			setEditor(null);
			return true;
		}
		const update = (current: Issue) =>
			'uncertainty_id' in updatedState
				? {
						...current,
						uncertainty: {
							...current.uncertainty,
							outcomes: editor.isNew
								? current.uncertainty.outcomes.some(
										state => state.id === updatedState.id,
									)
									? current.uncertainty.outcomes
									: [...current.uncertainty.outcomes, updatedState]
								: current.uncertainty.outcomes.map(state =>
										state.id === updatedState.id
											? {
													...state,
													name: updatedState.name,
													utility: updatedState.utility,
												}
											: state,
									),
						},
					}
				: {
						...current,
						decision: {
							...current.decision,
							options: editor.isNew
								? current.decision.options.some(
										state => state.id === updatedState.id,
									)
									? current.decision.options
									: [...current.decision.options, updatedState]
								: current.decision.options.map(state =>
										state.id === updatedState.id
											? {
													...state,
													name: updatedState.name,
													utility: updatedState.utility,
												}
											: state,
									),
						},
					};
		return persist(update);
	};

	const persist = async (update: (current: Issue) => Issue) => {
		saving.current = true;
		savedUpdate.current = update;
		try {
			await mutateAsync(() =>
				update(
					queryClient
						.getQueryData<Issue[]>(['issues'])
						?.find(saved => saved.id === issue.id) ?? issue,
				),
			);
			return true;
		} catch {
			return false;
		} finally {
			savedUpdate.current = null;
			saving.current = false;
			setEditor(null);
		}
	};

	return (
		<Collapsible
			open={expanded}
			className='flex flex-col'
			onOpenChange={async () => {
				if (!editor || (await save())) toggle();
			}}
			data-no-dnd='true'
		>
			{rows.length > 0 && (
				<CollapsibleContent className='pt-2'>
					<ul
						ref={listRef}
						className='mb-2 flex w-full flex-col gap-2 rounded-sm text-sm'
					>
						{rows.map(state => (
							<li
								key={state.id}
								className={cn('group pointer-events-auto rounded-sm', {
									'bg-background-light px-2 py-1': editor?.state.id !== state.id,
								})}
							>
								{editor?.state.id === state.id ? (
									<fieldset
										disabled={isPending}
										className='grid grid-cols-[minmax(0,1fr)_5rem_auto] items-start gap-2'
										onBlur={event => {
											if (
												!event.currentTarget.contains(
													event.relatedTarget,
												) &&
												!listRef.current?.contains(event.relatedTarget) &&
												event.relatedTarget !== expandRef.current &&
												event.relatedTarget !== addRef.current
											) {
												save();
											}
										}}
										onKeyDown={event => {
											if (
												event.key === 'Enter' &&
												event.target instanceof HTMLInputElement
											) {
												event.preventDefault();
												save();
											}
											if (event.key === 'Escape') {
												event.preventDefault();
												event.stopPropagation();
												discard();
											}
										}}
									>
										{/* Remove precedes Name in tab order, keeping Name → Utility → next Name. */}
										<Button
											variant='ghost'
											tone='neutral'
											icon
											className='col-start-3 row-start-1'
											aria-label={`Remove ${stateType}`}
											onClick={remove}
										>
											<Icon data={remove_outlined} size='md' />
										</Button>
										<TextField
											aria-label='Name'
											className='col-start-1 row-start-1'
											ref={nameRef}
											invalid={!!error}
											helperMessage={
												error ? (
													<>
														<span>{error}</span> ·{' '}
														<span>Esc to cancel</span>
													</>
												) : undefined
											}
											autoFocus={editor.field === 'name'}
											value={editor.name}
											onChange={event =>
												setEditor({ ...editor, name: event.target.value })
											}
										/>
										<TextField
											aria-label='Utility'
											className='col-start-2 row-start-1'
											type='number'
											step='any'
											autoFocus={editor.field === 'utility'}
											value={editor.utility}
											onChange={event =>
												setEditor({
													...editor,
													utility: event.target.value,
												})
											}
										/>
									</fieldset>
								) : (
									<div className='flex items-center justify-between gap-2'>
										<Button
											variant='ghost'
											tone='neutral'
											size='small'
											aria-label={`Edit ${stateType} name: ${state.name}`}
											className='relative h-auto! min-h-0! min-w-0 flex-1 justify-start! gap-0! truncate p-0! text-inherit! [font:inherit]!'
											onFocus={() => start(state, 'name')}
											onClick={() => start(state, 'name')}
										>
											<span className='truncate'>{state.name}</span>
											<Icon
												data={edit}
												size='sm'
												className='bg-background-light absolute right-0 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100'
											/>
										</Button>
										<Button
											variant='ghost'
											tone='neutral'
											size='small'
											aria-label={`Edit ${stateType} utility: ${state.name}`}
											className='h-auto! min-h-0! p-0! text-inherit! [font:inherit]!'
											onFocus={() => start(state, 'utility')}
											onClick={() => start(state, 'utility')}
										>
											{state.utility}
										</Button>
									</div>
								)}
							</li>
						))}
					</ul>
				</CollapsibleContent>
			)}
			{(expanded || states.length === 0) && (
				<Button
					ref={addRef}
					variant='ghost'
					size='small'
					className='pointer-events-auto mb-2 self-start'
					disabled={isPending}
					onClick={startNew}
				>
					<Icon data={add} size='sm' />
					Add {stateType}
				</Button>
			)}
			{states.length > 0 && (
				<CollapsibleTrigger asChild>
					<Button
						ref={expandRef}
						variant='ghost'
						size='small'
						className='text-text-tertiary pointer-events-auto ml-auto flex gap-2! p-0! [font-family:inherit]! text-sm! leading-5! font-normal!'
					>
						{states.length} States
						<Icon
							data={expanded ? chevron_up : chevron_down}
							size='lg'
							className='text-primary-resting'
						/>
					</Button>
				</CollapsibleTrigger>
			)}
		</Collapsible>
	);
};
