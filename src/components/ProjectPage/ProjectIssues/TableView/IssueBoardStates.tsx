import { Button, Icon, TextField } from '@equinor/eds-core-react/next';
import { chevron_down, chevron_up, edit } from '@equinor/eds-icons';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useUpdateIssue } from '../../../../hooks/api/useUpdateIssue';
import { useExpandCard } from '../../../../hooks/useExpandCard';
import { sortByCreatedAt } from '../../../../utils/sortByCreatedAt';
import { Issue, Option, optionSchema, Outcome, outcomeSchema } from '../../../../validators';

type Editor = {
	state: Option | Outcome;
	name: string;
	utility: string;
	field: 'name' | 'utility';
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
	const saving = useRef(false);
	const { mutateAsync, isPending } = useUpdateIssue({ issueId: issue.id });
	const editing = editor !== null;
	useEffect(() => {
		onEditingChange?.(issue.id, editing);
		return () => onEditingChange?.(issue.id, false);
	}, [issue.id, editing, onEditingChange]);
	const states = sortByCreatedAt<Option | Outcome>(
		issue.type === 'Uncertainty' ? issue.uncertainty.outcomes : issue.decision.options,
	);
	const stateType = issue.type === 'Uncertainty' ? 'outcome' : 'option';

	const start = async (state: Option | Outcome, field: Editor['field']) => {
		if (saving.current || editor?.state.id === state.id) return;
		if (editor && !(await save())) return;
		setError(undefined);
		setEditor({ state, name: state.name, utility: String(state.utility ?? 0), field });
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
			updatedState.name === editor.state.name &&
			updatedState.utility === (editor.state.utility ?? 0)
		) {
			setEditor(null);
			return true;
		}
		const updated = () => {
			const current =
				queryClient
					.getQueryData<Issue[]>(['issues'])
					?.find(saved => saved.id === issue.id) ?? issue;
			return issue.type === 'Uncertainty'
				? {
						...current,
						uncertainty: {
							...current.uncertainty,
							outcomes: current.uncertainty.outcomes.map(state =>
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
							options: current.decision.options.map(state =>
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
		};
		saving.current = true;
		try {
			await mutateAsync(updated);
			await queryClient.cancelQueries({ queryKey: ['issues'] }, { revert: false });
			queryClient.setQueryData<Issue[]>(['issues'], issues =>
				issues?.map(current => {
					if (current.id !== issue.id) return current;
					return issue.type === 'Uncertainty'
						? {
								...current,
								uncertainty: {
									...current.uncertainty,
									outcomes: current.uncertainty.outcomes.map(state =>
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
									options: current.decision.options.map(state =>
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
				}),
			);
			return true;
		} catch {
			return false;
		} finally {
			saving.current = false;
			setEditor(null);
		}
	};

	return (
		<Collapsible
			open={expanded}
			onOpenChange={async () => {
				if (!editor || (await save())) toggle();
			}}
			data-no-dnd='true'
		>
			<CollapsibleContent>
				<ul ref={listRef} className='mb-2 flex w-full flex-col gap-2 rounded-sm text-sm'>
					{states.map(state => (
						<li
							key={state.id}
							className='bg-background-light group pointer-events-auto rounded-sm px-2 py-1'
						>
							{editor?.state.id === state.id ? (
								<fieldset
									disabled={isPending}
									className='grid grid-cols-[minmax(0,1fr)_5rem] gap-2'
									onBlur={event => {
										if (
											!event.currentTarget.contains(event.relatedTarget) &&
											!listRef.current?.contains(event.relatedTarget) &&
											event.relatedTarget !== expandRef.current
										) {
											save();
										}
									}}
									onKeyDown={event => {
										if (event.key === 'Enter') {
											event.preventDefault();
											save();
										}
										if (event.key === 'Escape') {
											event.preventDefault();
											event.stopPropagation();
											setError(undefined);
											setEditor(null);
										}
									}}
								>
									<TextField
										label='Name'
										ref={nameRef}
										invalid={!!error}
										helperMessage={error}
										autoFocus={editor.field === 'name'}
										value={editor.name}
										onChange={event =>
											setEditor({ ...editor, name: event.target.value })
										}
									/>
									<TextField
										label='Utility'
										type='number'
										step='any'
										autoFocus={editor.field === 'utility'}
										value={editor.utility}
										onChange={event =>
											setEditor({ ...editor, utility: event.target.value })
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
										className='min-w-0 justify-start! truncate px-0!'
										onFocus={() => start(state, 'name')}
										onClick={() => start(state, 'name')}
									>
										<span className='truncate'>{state.name}</span>
										<Icon
											data={edit}
											size='sm'
											className='shrink-0 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100'
										/>
									</Button>
									<Button
										variant='ghost'
										tone='neutral'
										size='small'
										aria-label={`Edit ${stateType} utility: ${state.name}`}
										className='px-0!'
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
			<CollapsibleTrigger asChild>
				<Button
					ref={expandRef}
					variant='ghost'
					size='small'
					className='pointer-events-auto ml-auto flex'
				>
					{states.length} States
					<Icon data={expanded ? chevron_up : chevron_down} size='sm' />
				</Button>
			</CollapsibleTrigger>
		</Collapsible>
	);
};
