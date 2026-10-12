import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'jotai';
import { useState } from 'react';
import { Toaster, toast } from 'sonner';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { apiClient } from '../../../api';
import { existingIssue, project } from '../../../test/issueFixtures';
import { Issue, issueSchema, Option, Outcome } from '../../../validators';
import {
	IssueCard,
	IssueCardContent,
	IssueCardHeader,
	IssueCardStates,
} from '../../common/Cards/IssueCard';
import { ProjectContext } from '../ProjectContext';
import { ListView } from './ListView/ListView';
import { TableView } from './TableView/TableView';

vi.hoisted(() => {
	vi.stubGlobal(
		'ResizeObserver',
		class {
			observe() {}
			unobserve() {}
			disconnect() {}
		},
	);
});

vi.mock('../../../api', () => ({
	apiClient: { get: vi.fn(), put: vi.fn() },
}));

let savedIssue: Issue;

beforeEach(() => {
	savedIssue = existingIssue();
	vi.mocked(apiClient.get).mockImplementation(async () => ({
		data: [structuredClone(savedIssue)],
	}));
	vi.mocked(apiClient.put).mockImplementation(async (_url, body) => {
		[savedIssue] = issueSchema.array().parse(body);
		return { data: [savedIssue] };
	});
});

afterEach(() => {
	toast.dismiss();
	vi.clearAllMocks();
});

const renderIssues = (view = <ListView />) => {
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	render(
		<QueryClientProvider client={client}>
			<Provider>
				<ProjectContext value={project}>{view}</ProjectContext>
			</Provider>
			<Toaster />
		</QueryClientProvider>,
	);
	return userEvent.setup();
};

const views = ['List', 'Board'] as const;
const textCases = views.flatMap(view =>
	(['name', 'description'] as const).map(field => ({ view, field })),
);
const renderView = (view: (typeof views)[number]) =>
	renderIssues(view === 'List' ? <ListView /> : <TableView />);
const outsideField = (view: (typeof views)[number]) =>
	screen.getByRole('heading', { name: view === 'List' ? 'Issues' : 'Decision' });
const inlineFields = () =>
	within(
		screen.queryByRole('table', { name: 'Issues filtered out' }) ??
			screen.getByRole('region', { name: 'Decision issues' }),
	);

test('Board text editors remain accessible while card dragging is blocked', async () => {
	const user = renderView('Board');
	await user.click(
		await screen.findByRole('button', { name: 'Edit issue name: Existing issue' }),
	);
	const input = inlineFields().getByRole('textbox', { name: 'Issue name' });
	await user.type(input, ' unsaved');
	expect(input.closest('[aria-disabled="true"]')).toBeNull();
	await user.keyboard('{Escape}');
	expect(apiClient.put).not.toHaveBeenCalled();
});

test.each(views)(
	'%s saves the issue name once on Enter, retains nested data, and notifies only after success',
	async view => {
		const original = existingIssue();
		let finish!: () => void;
		vi.mocked(apiClient.put).mockImplementation(
			async (_url, body) =>
				new Promise(resolve => {
					finish = () => {
						[savedIssue] = issueSchema.array().parse(body);
						resolve({ data: [savedIssue] });
					};
				}),
		);
		const user = renderView(view);
		await user.click(
			await screen.findByRole('button', { name: 'Edit issue name: Existing issue' }),
		);
		const input = inlineFields().getByRole('textbox', { name: 'Issue name' });
		expect(input).toHaveFocus();
		expect(input).toHaveValue(original.name);
		await user.clear(input);
		await user.type(input, ' Updated issue ');
		await user.keyboard('{Enter}{Enter}');
		await user.click(outsideField(view));
		await waitFor(() => expect(apiClient.put).toHaveBeenCalledTimes(1));
		expect(screen.queryByText('Name updated')).not.toBeInTheDocument();
		await act(async () => finish());
		expect(
			await screen.findByRole('button', { name: 'Edit issue name: Updated issue' }),
		).toBeInTheDocument();
		expect(await screen.findByText('Name updated')).toBeInTheDocument();
		expect(apiClient.put).toHaveBeenCalledWith('/issues', [
			{ ...original, name: ' Updated issue ' },
		]);
		expect(screen.queryByRole('button', { name: /undo/i })).not.toBeInTheDocument();
	},
);

test.each(views)(
	'%s descriptions retain meaningful whitespace and Shift+Enter newlines before Enter saves',
	async view => {
		const user = renderView(view);
		await user.click(await screen.findByRole('button', { name: /^Edit issue description:/ }));
		const input = screen.getByRole('textbox', { name: 'Issue description' });
		expect(input).toHaveFocus();
		expect(input).toHaveValue(existingIssue().description);
		if (view === 'Board')
			expect(input).toHaveAccessibleDescription(/Shift\+Enter for a newline/);
		await user.clear(input);
		await user.type(input, ' First line{Shift>}{Enter}{/Shift}Second line ');
		expect(input).toHaveValue(' First line\nSecond line ');
		expect(apiClient.put).not.toHaveBeenCalled();
		await user.keyboard('{Enter}');
		expect(await screen.findByText('Description updated')).toBeInTheDocument();
		expect(apiClient.put).toHaveBeenCalledWith('/issues', [
			{ ...existingIssue(), description: ' First line\nSecond line ' },
		]);
	},
);

test.each(textCases)(
	'$view Escape cancels the $field edit without a blur save',
	async ({ view, field }) => {
		const user = renderView(view);
		await user.click(
			await screen.findByRole('button', { name: new RegExp(`^Edit issue ${field}:`) }),
		);
		const input = inlineFields().getByRole('textbox', { name: `Issue ${field}` });
		await user.clear(input);
		await user.type(input, 'Attempt to discard');
		await user.keyboard('{Escape}');
		await user.click(outsideField(view));
		expect(
			inlineFields().queryByRole('textbox', { name: `Issue ${field}` }),
		).not.toBeInTheDocument();
		const trigger = screen.getByRole('button', { name: new RegExp(`^Edit issue ${field}:`) });
		expect(trigger).toHaveTextContent(
			field === 'name' ? 'Existing issue' : 'First paragraph Second paragraph',
		);
		await user.click(trigger);
		expect(inlineFields().getByRole('textbox', { name: `Issue ${field}` })).toHaveValue(
			existingIssue()[field],
		);
		expect(apiClient.put).not.toHaveBeenCalled();
	},
);

test.each(textCases)(
	'$view blank $field stays editable on Enter and outside click, then saves a correction',
	async ({ view, field }) => {
		const user = renderView(view);
		await user.click(
			await screen.findByRole('button', { name: new RegExp(`^Edit issue ${field}:`) }),
		);
		const input = inlineFields().getByRole('textbox', { name: `Issue ${field}` });
		await user.clear(input);
		await user.type(input, '   ');
		await user.keyboard('{Enter}');
		expect(input).toHaveAttribute('aria-invalid', 'true');
		expect(input).toHaveAccessibleDescription(new RegExp(`Issue ${field} is required`));
		expect(screen.getByText(`Issue ${field} is required`)).toBeInTheDocument();
		expect(screen.getByText(/Esc to cancel/)).toBeInTheDocument();
		if (view === 'Board') {
			expect(input).toHaveAccessibleDescription(/Enter to save.*Esc to cancel/);
			if (field === 'description')
				expect(input).toHaveAccessibleDescription(/Shift\+Enter for a newline/);
		}
		await user.click(outsideField(view));
		expect(inlineFields().getByRole('textbox', { name: `Issue ${field}` })).toBeInTheDocument();
		expect(apiClient.put).not.toHaveBeenCalled();
		await user.clear(input);
		await user.type(input, 'Corrected value');
		await user.keyboard('{Enter}');
		expect(
			await screen.findByText(field === 'name' ? 'Name updated' : 'Description updated'),
		).toBeInTheDocument();
		expect(apiClient.put).toHaveBeenCalledWith('/issues', [
			{ ...existingIssue(), [field]: 'Corrected value' },
		]);
	},
);

test.each(['name', 'description'] as const)(
	'Board %s saves inline without changing the card border or losing classification and state expansion',
	async field => {
		const user = renderIssues(<TableView />);
		const region = await screen.findByRole('region', { name: 'Decision issues' });
		const trigger = await within(region).findByRole('button', {
			name: new RegExp(`^Edit issue ${field}:`),
		});
		const card = trigger.closest<HTMLDivElement>('.shadow-tile')!;
		const originalClasses = card.className;
		expect(
			within(card).getByRole('button', { name: 'Decision' }),
		).toBeInTheDocument();
		expect(within(card).getByRole('button', { name: 'Out' })).toBeInTheDocument();
		await user.click(trigger);
		const input = inlineFields().getByRole('textbox', { name: `Issue ${field}` });
		expect(input).toHaveFocus();
		expect(input).toHaveValue(existingIssue()[field]);
		expect(card.className).toBe(originalClasses);
		expect(screen.getByText(/Enter to save.*Esc to cancel/)).toBeInTheDocument();
		await user.clear(input);
		await user.type(input, 'Updated Board text{Enter}');
		expect(
			await screen.findByText(field === 'name' ? 'Name updated' : 'Description updated'),
		).toBeInTheDocument();
		expect(
			await within(region).findByRole('button', {
				name: `Edit issue ${field}: Updated Board text`,
			}),
		).toBeInTheDocument();
		expect(card.className).toBe(originalClasses);
		await user.click(within(card).getByRole('button', { name: /1 States/ }));
		expect(within(card).getByText('Existing option')).toBeVisible();
	},
);

test('Board dragging stays disabled until every active text editor closes, including invalid editors', async () => {
	const user = renderIssues(<TableView />);
	const name = await screen.findByRole('button', { name: /^Edit issue name:/ });
	await waitFor(() =>
		expect(name.closest('[aria-roledescription="draggable"]')).toHaveAttribute(
			'aria-disabled',
			'false',
		),
	);
	const draggable = name.closest('[aria-roledescription="draggable"]')!;
	await user.click(name);
	await waitFor(() => expect(draggable).toHaveAttribute('data-no-dnd', 'true'));
	const nameInput = inlineFields().getByRole('textbox', { name: 'Issue name' });
	await user.clear(nameInput);
	await user.keyboard('{Enter}');
	await user.click(screen.getByRole('button', { name: /^Edit issue description:/ }));
	expect(screen.getByRole('textbox', { name: 'Issue description' })).toHaveFocus();
	await user.keyboard('{Escape}');
	await waitFor(() => expect(draggable).toHaveAttribute('data-no-dnd', 'true'));
	await user.click(nameInput);
	await user.keyboard('{Escape}');
	await waitFor(() => expect(draggable).not.toHaveAttribute('data-no-dnd'));
	expect(apiClient.put).not.toHaveBeenCalled();
});

test.each(textCases)(
	'$view failed $field save loses the attempt and reopens the persisted value',
	async ({ view, field }) => {
		vi.mocked(apiClient.put).mockRejectedValueOnce(new Error('Save unavailable'));
		const user = renderView(view);
		await user.click(
			await screen.findByRole('button', { name: new RegExp(`^Edit issue ${field}:`) }),
		);
		const input = inlineFields().getByRole('textbox', { name: `Issue ${field}` });
		await user.clear(input);
		await user.type(input, 'Failed attempt');
		await user.keyboard('{Enter}');
		expect(await screen.findByText('Failed to update issue')).toBeInTheDocument();
		expect(
			inlineFields().queryByRole('textbox', { name: `Issue ${field}` }),
		).not.toBeInTheDocument();
		expect(
			screen.queryByText(field === 'name' ? 'Name updated' : 'Description updated'),
		).not.toBeInTheDocument();
		const trigger = screen.getByRole('button', { name: new RegExp(`^Edit issue ${field}:`) });
		expect(trigger).not.toHaveTextContent('Failed attempt');
		await user.click(trigger);
		expect(inlineFields().getByRole('textbox', { name: `Issue ${field}` })).toHaveValue(
			existingIssue()[field],
		);
		await user.keyboard('{Escape}');
		expect(apiClient.put).toHaveBeenCalledTimes(1);
	},
);

test.each(textCases)(
	'$view IME confirmation and Escape do not submit or cancel the $field editor',
	async ({ view, field }) => {
		const user = renderView(view);
		await user.click(
			await screen.findByRole('button', { name: new RegExp(`^Edit issue ${field}:`) }),
		);
		const input = inlineFields().getByRole('textbox', { name: `Issue ${field}` });
		await user.clear(input);
		await user.type(input, '日本語');
		await act(async () => {
			fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
		});
		expect(input).toBeInTheDocument();
		expect(apiClient.put).not.toHaveBeenCalled();
		await act(async () => {
			fireEvent.keyDown(input, { key: 'Escape', isComposing: true });
		});
		expect(input).toBeInTheDocument();
		await act(async () => {
			fireEvent.keyDown(input, { key: 'Enter', keyCode: 229 });
		});
		expect(apiClient.put).not.toHaveBeenCalled();
		await user.keyboard('{Enter}');
		expect(
			await screen.findByText(field === 'name' ? 'Name updated' : 'Description updated'),
		).toBeInTheDocument();
		expect(apiClient.put).toHaveBeenCalledTimes(1);
	},
);

test.each(textCases)(
	'$view saves only a changed $field on outside click and does not save unchanged edits',
	async ({ view, field }) => {
		const user = renderView(view);
		const triggerName = new RegExp(`^Edit issue ${field}:`);
		const outside = outsideField(view);
		await user.click(await screen.findByRole('button', { name: triggerName }));
		await user.keyboard('{Enter}');
		expect(
			inlineFields().queryByRole('textbox', { name: `Issue ${field}` }),
		).not.toBeInTheDocument();
		expect(apiClient.put).not.toHaveBeenCalled();
		await user.click(screen.getByRole('button', { name: triggerName }));
		await user.click(outside);
		expect(apiClient.put).not.toHaveBeenCalled();
		await user.click(screen.getByRole('button', { name: triggerName }));
		const input = inlineFields().getByRole('textbox', { name: `Issue ${field}` });
		await user.clear(input);
		await user.type(input, 'Saved by outside click');
		await user.click(outside);
		expect(
			await screen.findByText(field === 'name' ? 'Name updated' : 'Description updated'),
		).toBeInTheDocument();
		expect(apiClient.put).toHaveBeenCalledTimes(1);
		expect(apiClient.put).toHaveBeenCalledWith('/issues', [
			{ ...existingIssue(), [field]: 'Saved by outside click' },
		]);
	},
);

test.each(textCases)(
	'$view keyboard users can discover the $field editor and Escape returns focus to its pencil button',
	async ({ view, field }) => {
		const user = renderView(view);
		const trigger = await screen.findByRole('button', {
			name: new RegExp(`^Edit issue ${field}:`),
		});
		for (let step = 0; step < 30 && document.activeElement !== trigger; step++)
			await user.tab();
		expect(trigger).toHaveFocus();
		await user.keyboard('{Enter}');
		const input = inlineFields().getByRole('textbox', { name: `Issue ${field}` });
		expect(input).toHaveFocus();
		await user.clear(input);
		await user.type(input, 'Cancel with keyboard');
		await user.keyboard('{Escape}');
		expect(
			screen.getByRole('button', { name: new RegExp(`^Edit issue ${field}:`) }),
		).toHaveFocus();
		expect(apiClient.put).not.toHaveBeenCalled();
	},
);

test.each(views)(
	'%s keeps both text changes when a description save is queued behind a pending name save',
	async view => {
		let finish!: () => void;
		vi.mocked(apiClient.put).mockImplementationOnce(
			async (_url, body) =>
				new Promise(resolve => {
					finish = () => {
						[savedIssue] = issueSchema.array().parse(body);
						resolve({ data: [savedIssue] });
					};
				}),
		);
		const user = renderView(view);
		await user.click(await screen.findByRole('button', { name: /^Edit issue name:/ }));
		const name = inlineFields().getByRole('textbox', { name: 'Issue name' });
		await user.clear(name);
		await user.type(name, 'Revised name{Enter}');
		await waitFor(() => expect(apiClient.put).toHaveBeenCalledTimes(1));
		expect(
			await screen.findByRole('button', { name: 'Edit issue name: Revised name' }),
		).toBeEnabled();
		await user.click(screen.getByRole('button', { name: /^Edit issue description:/ }));
		const description = screen.getByRole('textbox', { name: 'Issue description' });
		expect(description).toBeEnabled();
		await user.clear(description);
		await user.type(description, 'Revised description{Enter}');
		expect(
			await screen.findByRole('button', {
				name: 'Edit issue description: Revised description',
			}),
		).toBeEnabled();
		expect(apiClient.put).toHaveBeenCalledTimes(1);
		await act(async () => finish());
		expect(await screen.findByText('Description updated')).toBeInTheDocument();
		expect(
			await screen.findByRole('button', { name: 'Edit issue name: Revised name' }),
		).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: 'Edit issue description: Revised description' }),
		).toBeInTheDocument();
		expect(apiClient.put).toHaveBeenLastCalledWith('/issues', [
			{ ...existingIssue(), name: 'Revised name', description: 'Revised description' },
		]);
	},
);

test.each(views)(
	'%s can queue classification changes while an optimistic text save is pending',
	async view => {
		let finish!: () => void;
		vi.mocked(apiClient.put).mockImplementationOnce(
			async (_url, body) =>
				new Promise(resolve => {
					finish = () => {
						[savedIssue] = issueSchema.array().parse(body);
						resolve({ data: [savedIssue] });
					};
				}),
		);
		const user = renderView(view);
		await user.click(await screen.findByRole('button', { name: /^Edit issue name:/ }));
		const input = inlineFields().getByRole('textbox', { name: 'Issue name' });
		await user.clear(input);
		await user.type(input, 'Pending name{Enter}');
		const type = screen.getByRole('button', { name: 'Decision' });
		expect(type).toBeEnabled();
		expect(screen.getByRole('button', { name: 'Out' })).toBeEnabled();
		expect(screen.getByRole('button', { name: 'Tactical' })).toBeEnabled();
		await user.click(type);
		await user.click(
			within(screen.getByRole('menu', { name: 'ISSUE TYPE' })).getByRole('menuitem', {
				name: 'Fact',
			}),
		);
		expect(apiClient.put).toHaveBeenCalledTimes(1);
		await act(async () => finish());
		await waitFor(() =>
			expect(savedIssue).toMatchObject({ type: 'Fact', name: 'Pending name' }),
		);
		expect(apiClient.put).toHaveBeenLastCalledWith('/issues', [
			{ ...existingIssue(), type: 'Fact', name: 'Pending name' },
		]);
		expect(
			screen.getByRole('button', { name: 'Edit issue name: Pending name' }),
		).toBeInTheDocument();
	},
);

test.each(textCases)(
	'$view empty $field can be canceled after validation without a blur request',
	async ({ view, field }) => {
		const user = renderView(view);
		await user.click(
			await screen.findByRole('button', { name: new RegExp(`^Edit issue ${field}:`) }),
		);
		await user.clear(inlineFields().getByRole('textbox', { name: `Issue ${field}` }));
		await user.click(outsideField(view));
		expect(screen.getByText(new RegExp(`Issue ${field} is required`))).toBeInTheDocument();
		const input = inlineFields().getByRole('textbox', { name: `Issue ${field}` });
		await user.click(input);
		await user.keyboard('{Escape}');
		await user.click(outsideField(view));
		await user.click(screen.getByRole('button', { name: new RegExp(`^Edit issue ${field}:`) }));
		expect(inlineFields().getByRole('textbox', { name: `Issue ${field}` })).toHaveValue(
			existingIssue()[field],
		);
		expect(apiClient.put).not.toHaveBeenCalled();
	},
);

test.each(textCases)(
	'$view failed outside-click $field save restores its persisted value',
	async ({ view, field }) => {
		vi.mocked(apiClient.put).mockRejectedValueOnce(new Error('Save unavailable'));
		const user = renderView(view);
		await user.click(
			await screen.findByRole('button', { name: new RegExp(`^Edit issue ${field}:`) }),
		);
		const input = inlineFields().getByRole('textbox', { name: `Issue ${field}` });
		await user.clear(input);
		await user.type(input, 'Discarded outside-click attempt');
		await user.click(outsideField(view));
		expect(await screen.findByText('Failed to update issue')).toBeInTheDocument();
		expect(
			inlineFields().queryByRole('textbox', { name: `Issue ${field}` }),
		).not.toBeInTheDocument();
		await user.click(screen.getByRole('button', { name: new RegExp(`^Edit issue ${field}:`) }));
		expect(inlineFields().getByRole('textbox', { name: `Issue ${field}` })).toHaveValue(
			existingIssue()[field],
		);
		await user.keyboard('{Escape}');
		expect(apiClient.put).toHaveBeenCalledTimes(1);
	},
);

test.each(['success', 'failure'])(
	'Board dragging resumes when the editor closes while a save awaits %s',
	async result => {
		let finish!: () => void;
		vi.mocked(apiClient.put).mockImplementationOnce(
			async (_url, body) =>
				new Promise((resolve, reject) => {
					finish = () => {
						if (result === 'failure') reject(new Error('Save unavailable'));
						else {
							[savedIssue] = issueSchema.array().parse(body);
							resolve({ data: [savedIssue] });
						}
					};
				}),
		);
		const user = renderView('Board');
		const trigger = await screen.findByRole('button', { name: /^Edit issue name:/ });
		await waitFor(() =>
			expect(trigger.closest('[aria-roledescription="draggable"]')).toHaveAttribute(
				'aria-disabled',
				'false',
			),
		);
		const draggable = trigger.closest('[aria-roledescription="draggable"]')!;
		await user.click(trigger);
		const input = inlineFields().getByRole('textbox', { name: 'Issue name' });
		await user.clear(input);
		await user.type(input, 'Pending Board name{Enter}');
		await waitFor(() => expect(apiClient.put).toHaveBeenCalledTimes(1));
		expect(
			inlineFields().queryByRole('textbox', { name: 'Issue name' }),
		).not.toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: 'Edit issue name: Pending Board name' }),
		).toBeEnabled();
		await waitFor(() => expect(draggable).not.toHaveAttribute('data-no-dnd'));
		await act(async () => finish());
		await waitFor(() => expect(draggable).not.toHaveAttribute('data-no-dnd'));
		expect(
			inlineFields().queryByRole('textbox', { name: 'Issue name' }),
		).not.toBeInTheDocument();
		expect(
			screen.getByRole('button', {
				name:
					result === 'success'
						? 'Edit issue name: Pending Board name'
						: 'Edit issue name: Existing issue',
			}),
		).toBeInTheDocument();
	},
);

const SharedCardExample = () => {
	const [selected, setSelected] = useState<Option | Outcome>();
	return (
		<>
			<IssueCard issue={existingIssue()} onClickState={setSelected} selectedState={selected}>
				<IssueCardHeader />
				<IssueCardContent />
				<IssueCardStates expandedProp />
			</IssueCard>
			<p role='status'>{selected ? `Selected: ${selected.name}` : 'No state selected'}</p>
		</>
	);
};

test('Shared non-Board cards retain plain issue text and existing state selection', async () => {
	const user = renderIssues(<SharedCardExample />);
	expect(screen.getByRole('heading', { name: 'Existing issue' })).toBeInTheDocument();
	expect(
		screen.queryByRole('button', { name: /^Edit issue (name|description):/ }),
	).not.toBeInTheDocument();
	await user.click(screen.getByText('Existing option'));
	expect(screen.getByRole('status')).toHaveTextContent('Selected: Existing option');
	expect(apiClient.put).not.toHaveBeenCalled();
});

test.each(views)('%s retains full Edit access beside inline fields', async view => {
	const user = renderView(view);
	const name = await screen.findByRole('button', { name: /^Edit issue name:/ });
	if (view === 'List')
		await user.click(screen.getByRole('button', { name: 'Edit issue: Existing issue' }));
	else {
		const card = name.closest<HTMLDivElement>('.shadow-tile')!;
		await user.click(within(card).getByRole('button', { name: 'Issue actions' }));
		await user.click(await screen.findByRole('menuitem', { name: 'Edit' }));
	}
	const dialog = await screen.findByRole('dialog', { name: 'Edit Issue' });
	expect(within(dialog).getByRole('textbox', { name: 'Issue name' })).toHaveValue(
		existingIssue().name,
	);
	expect(within(dialog).getByRole('textbox', { name: 'Description' })).toHaveValue(
		existingIssue().description,
	);
	await user.click(screen.getByRole('button', { name: 'Cancel' }));
	expect(apiClient.put).not.toHaveBeenCalled();
});
