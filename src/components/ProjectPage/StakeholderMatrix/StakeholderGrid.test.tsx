import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { apiClient } from '../../../api';
import { project } from '../../../test/issueFixtures';
import { type StakeholderMatrixEntry, stakeholderMatrixEntrySchema } from '../../../validators';
import { ProjectContext } from '../ProjectContext';
import { StakeholderGrid } from './StakeholderGrid';
import { StakeholdersPanel } from './StakeholdersPanel';

vi.hoisted(() => {
	Document.prototype.getAnimations = () => [];
	Document.prototype.elementFromPoint = () => document.body;
	Element.prototype.getAnimations = () => [];
	Element.prototype.setPointerCapture = () => {};
	vi.stubGlobal('matchMedia', (query: string) => ({
		matches: query === '(prefers-reduced-motion: reduce)',
		media: query,
		addEventListener() {},
		removeEventListener() {},
	}));
	vi.stubGlobal(
		'ResizeObserver',
		class {
			constructor(
				private callback: (
					entries: { borderBoxSize: { inlineSize: number; blockSize: number }[] }[],
				) => void,
			) {}
			observe(element: Element) {
				if (element.getAttribute('aria-label')?.startsWith('Stakeholder matrix')) {
					this.callback([{ borderBoxSize: [{ inlineSize: 560, blockSize: 434 }] }]);
				}
			}
			unobserve() {}
			disconnect() {}
		},
	);
});

vi.mock('../../../api', () => ({
	apiClient: { get: vi.fn(), put: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

vi.mock('./CreateStakeholderMatrix', () => ({
	CreateStakeholderMatrix: () => null,
}));

const stakeholder: StakeholderMatrixEntry = {
	stakeholder_matrix_id: '00000000-0000-4000-8000-000000000001',
	project_id: project.id,
	stakeholder_name: 'Project sponsor',
	stakeholder_role: 'Sponsor',
	affecting_the_decision: 0.5,
	affected_by_the_decision: 0.5,
};

let savedStakeholders: StakeholderMatrixEntry[];

const getCardTranslation = (element: Element) => {
	if (!(element instanceof HTMLElement)) return { x: 0, y: 0 };
	const match = /translate\(([-\d.]+)%,\s*([-\d.]+)%\)/.exec(element.style.transform);
	const width = element.style.width === '160px' ? 160 : 100;
	return {
		x: (Number(match?.[1] ?? 0) * width) / 100,
		y: (Number(match?.[2] ?? 0) * 34) / 100,
	};
};

beforeEach(() => {
	savedStakeholders = [
		{ ...stakeholder },
		{
			...stakeholder,
			stakeholder_matrix_id: '00000000-0000-4000-8000-000000000003',
			project_id: '00000000-0000-4000-8000-000000000002',
			stakeholder_name: 'Other project sponsor',
		},
	];
	vi.mocked(apiClient.get).mockImplementation(async () => ({
		data: structuredClone(savedStakeholders),
	}));
	vi.mocked(apiClient.put).mockImplementation(async (_url, body) => {
		const updated = stakeholderMatrixEntrySchema.array().parse(body);
		savedStakeholders = savedStakeholders.map(
			current =>
				updated.find(
					next => next.stakeholder_matrix_id === current.stakeholder_matrix_id,
				) ?? current,
		);
		return { data: updated };
	});
	vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(560);
	vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(434);
	const getComputedStyle = window.getComputedStyle;
	vi.spyOn(window, 'getComputedStyle').mockImplementation((element, pseudoElement) => {
		const styles = getComputedStyle(element, pseudoElement);
		if (styles.transform.startsWith('translate(')) {
			const { x, y } = getCardTranslation(element);
			styles.transform = `matrix(1, 0, 0, 1, ${x}, ${y})`;
		}
		return styles;
	});
	vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
		this: HTMLElement,
	) {
		const slot = this.classList.contains('pointer-events-none') ? this : this.parentElement;
		if (slot?.classList.contains('pointer-events-none')) {
			const left = parseFloat(slot.style.left || '0');
			const top = parseFloat(slot.style.top || '0');
			const leftPosition = slot.style.left.endsWith('%') ? (left * 560) / 100 : left;
			const topPosition = slot.style.top.endsWith('%') ? (top * 434) / 100 : top;
			const translation = getCardTranslation(slot);
			const [translateX = '0', translateY = '0'] = slot.style
				.getPropertyValue('--dnd-translate')
				.split(' ');
			return new DOMRect(
				100 + leftPosition + translation.x + parseFloat(translateX || '0'),
				100 + topPosition + translation.y + parseFloat(translateY || '0'),
				this === slot && slot.style.width === '160px' ? 160 : 100,
				34,
			);
		}
		return new DOMRect(100, 100, 560, 434);
	});
});

afterEach(() => {
	vi.restoreAllMocks();
	vi.clearAllMocks();
});

const renderGrid = async (includePanel = false) => {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	const view = render(
		<QueryClientProvider client={queryClient}>
			<ProjectContext value={project}>
				<StakeholderGrid />
				{includePanel && (
					<StakeholdersPanel searchQuery='' onSearchChange={vi.fn()} onHide={vi.fn()} />
				)}
			</ProjectContext>
		</QueryClientProvider>,
	);
	return {
		...view,
		queryClient,
		card: await screen.findByRole('button', { name: /Project sponsor/ }),
		user: userEvent.setup(),
	};
};

const startKeyboardDrag = async (card: HTMLElement, user: ReturnType<typeof userEvent.setup>) => {
	card.focus();
	await user.keyboard('[Space]');
	await waitFor(() => expect(card).toHaveClass('cursor-grabbing'));
};

test('keyboard dragging saves normalized coordinates only when dropped', async () => {
	const { card, user } = await renderGrid();
	await startKeyboardDrag(card, user);
	await user.keyboard('[ArrowRight][ArrowUp]');
	expect(apiClient.put).not.toHaveBeenCalled();
	await user.keyboard('[Space]');
	await waitFor(() =>
		expect(apiClient.put).toHaveBeenCalledExactlyOnceWith('/stakeholder-matrix-entry', [
			{
				...stakeholder,
				affecting_the_decision: 0.5217391304347826,
				affected_by_the_decision: 0.525,
			},
		]),
	);
});

test.each([
	['[ArrowLeft>10/][ArrowUp>10/]', 0, 1],
	['[ArrowRight>10/][ArrowDown>10/]', 1, 0],
])('dragging past the plot edges clamps both axes: %s', async (keys, affecting, affected) => {
	const { card, user } = await renderGrid();
	await startKeyboardDrag(card, user);
	await user.keyboard(`{Shift>}${keys}{/Shift}[Space]`);
	await waitFor(() =>
		expect(apiClient.put).toHaveBeenCalledExactlyOnceWith('/stakeholder-matrix-entry', [
			{
				...stakeholder,
				affecting_the_decision: affecting,
				affected_by_the_decision: affected,
			},
		]),
	);
});

test('a short card stays at the visible right edge after dropping', async () => {
	const { card, user, unmount } = await renderGrid();
	const plot = screen.getByLabelText('Stakeholder matrix with 1 stakeholders');
	await startKeyboardDrag(card, user);
	await user.keyboard('{Shift>}[ArrowRight>10/]{/Shift}');
	await waitFor(() =>
		expect(card.getBoundingClientRect().right).toBe(plot.getBoundingClientRect().right),
	);
	await user.keyboard('[Space]');
	await waitFor(() => expect(card).toHaveClass('cursor-grab'));
	await waitFor(() =>
		expect(card.getBoundingClientRect().right).toBe(plot.getBoundingClientRect().right),
	);
	unmount();
	const reloaded = await renderGrid();
	expect(reloaded.card.getBoundingClientRect().right).toBe(
		screen.getByLabelText('Stakeholder matrix with 1 stakeholders').getBoundingClientRect()
			.right,
	);
});

test('Escape cancels a drag without saving a new position', async () => {
	const { card, user } = await renderGrid();
	await startKeyboardDrag(card, user);
	await user.keyboard('[ArrowRight][Escape]');
	await waitFor(() => expect(card).toHaveClass('cursor-grab'));
	expect(apiClient.put).not.toHaveBeenCalled();
	expect(card.getBoundingClientRect()).toMatchObject({ left: 330, top: 300 });
});

test('dropping without moving does not save', async () => {
	const { card, user } = await renderGrid();
	await startKeyboardDrag(card, user);
	await user.keyboard('[Space]');
	await waitFor(() => expect(card).toHaveClass('cursor-grab'));
	expect(apiClient.put).not.toHaveBeenCalled();
});

test('pointer dragging preserves the grab offset and saves the dropped position', async () => {
	const { card } = await renderGrid();
	fireEvent.pointerDown(card, {
		pointerId: 1,
		pointerType: 'mouse',
		button: 0,
		isPrimary: true,
		clientX: 350,
		clientY: 310,
	});
	fireEvent.pointerMove(document, { pointerId: 1, clientX: 360, clientY: 320 });
	await waitFor(() => expect(card).toHaveClass('cursor-grabbing'));
	fireEvent.pointerMove(document, { pointerId: 1, clientX: 450, clientY: 210 });
	await act(() => new Promise(resolve => requestAnimationFrame(resolve)));
	fireEvent.pointerUp(document, { pointerId: 1, clientX: 450, clientY: 210 });
	await waitFor(() =>
		expect(apiClient.put).toHaveBeenCalledExactlyOnceWith('/stakeholder-matrix-entry', [
			{
				...stakeholder,
				affecting_the_decision: 0.717391304347826,
				affected_by_the_decision: 0.75,
			},
		]),
	);
});

test('grid and panel share project-scoped query data and stay synchronized after a drop', async () => {
	const { card, user, queryClient } = await renderGrid(true);
	const panel = screen.getByRole('complementary');
	expect(apiClient.get).toHaveBeenCalledExactlyOnceWith('/stakeholder-matrix-entry');
	expect(screen.queryByText('Other project sponsor')).not.toBeInTheDocument();
	expect(within(panel).getByText('Affecting: 0.50')).toBeInTheDocument();

	await startKeyboardDrag(card, user);
	await user.keyboard('[ArrowRight][ArrowUp][Space]');
	await waitFor(() => expect(within(panel).getByText('Affecting: 0.52')).toBeInTheDocument());
	expect(within(panel).getByText('Affected: 0.53')).toBeInTheDocument();
	expect(queryClient.getQueryData(['stakeholderMatrixes'])).toEqual([
		{
			...stakeholder,
			affecting_the_decision: 0.5217391304347826,
			affected_by_the_decision: 0.525,
		},
		savedStakeholders[1],
	]);
});
