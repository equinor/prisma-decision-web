import { NodeProps } from '@xyflow/react';
import { render } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { ReactFlowWhiteboardNode } from '../../../types';
import { WhiteboardNode } from '../../../validators';
import { LARGE_STROKE_WIDTH, MEDIUM_STROKE_WIDTH, SMALL_STROKE_WIDTH } from './config';
import { createFreehandGeometry } from './freehandPath';
import { FreehandNode } from './FreehandNode';
import { whiteboardNodeStrokeColor } from './selectionStyles';

vi.mock('@xyflow/react', () => ({
	NodeResizer: () => null,
	useReactFlow: () => ({ getNodes: () => [] }),
}));

vi.mock('../../../hooks/api/useUpdateWhiteboardNodes', () => ({
	useUpdateWhiteboardNodes: () => ({ mutate: vi.fn() }),
}));

const geometry = createFreehandGeometry([
	[0, 0],
	[30, 20],
	[60, 0],
	[90, 20],
]);

const node: WhiteboardNode = {
	id: 'freehand',
	board_sheet_id: 'sheet',
	project_id: 'project',
	type: 'Freehand',
	data: geometry.path,
	width: geometry.width,
	height: geometry.height,
	x_position: geometry.position.x,
	y_position: geometry.position.y,
	rotation: 0,
	zIndex: 0,
	color: '#ff9200',
	stroke_width: MEDIUM_STROKE_WIDTH,
	stroke_style: 'Solid',
};

const nodeProps: NodeProps<ReactFlowWhiteboardNode> = {
	id: node.id,
	data: node,
	type: 'Freehand',
	dragging: false,
	zIndex: 0,
	selectable: true,
	deletable: true,
	selected: false,
	draggable: true,
	isConnectable: false,
	positionAbsoluteX: 0,
	positionAbsoluteY: 0,
};

test.each([
	['Dashed', '16 16'],
	['Dotted', '3 10'],
] as const)('renders %s freehand lines with visible gaps', (stroke_style, pattern) => {
	const { container } = render(<FreehandNode {...nodeProps} data={{ ...node, stroke_style }} />);

	const visiblePath = container.querySelector('path[stroke="#ff9200"]');
	expect(visiblePath).toHaveAttribute('stroke-dasharray', pattern);
	expect(visiblePath).toHaveAttribute('fill', 'none');
	expect(visiblePath).toHaveAttribute('stroke-linecap', 'round');
	expect(visiblePath).toHaveAttribute('pointer-events', 'stroke');
	expect(visiblePath).toHaveAttribute('d', geometry.path);
	expect(visiblePath?.getAttribute('d')).not.toMatch(/Z/i);

	const hitPath = container.querySelector('path[stroke="transparent"]');
	expect(hitPath).toHaveAttribute('stroke-width', '18');
	expect(hitPath).not.toHaveAttribute('stroke-dasharray');
});

test.each(['Dashed', 'Dotted'] as const)(
	'keeps %s strokes visible and distinct at every supported width',
	stroke_style => {
		const { container, rerender } = render(<FreehandNode {...nodeProps} />);

		for (const [stroke_width, renderedWidth] of [
			[SMALL_STROKE_WIDTH, 2],
			[MEDIUM_STROKE_WIDTH, 4],
			[LARGE_STROKE_WIDTH, 6],
		]) {
			rerender(
				<FreehandNode {...nodeProps} data={{ ...node, stroke_style, stroke_width }} />,
			);
			expect(container.querySelector('path[stroke="#ff9200"]')).toHaveAttribute(
				'stroke-width',
				String(renderedWidth),
			);
		}
	},
);

test.each(['Solid', undefined] as const)(
	'renders solid centerlines for stroke style %s',
	stroke_style => {
		const { container, rerender } = render(
			<FreehandNode {...nodeProps} data={{ ...node, stroke_style: 'Dashed' }} />,
		);
		rerender(<FreehandNode {...nodeProps} data={{ ...node, stroke_style }} />);

		const visiblePath = container.querySelector('path[stroke="#ff9200"]');
		expect(visiblePath).toHaveAttribute('fill', 'none');
		expect(visiblePath).not.toHaveAttribute('stroke-dasharray');
		expect(visiblePath).toHaveAttribute('stroke-width', '4');
		expect(visiblePath).toHaveAttribute('pointer-events', 'stroke');
		expect(visiblePath).toHaveAttribute('d', geometry.path);
	},
);

test.each(['Solid', 'Dashed', 'Dotted'] as const)(
	'preserves default color, opacity, and default width for %s strokes',
	stroke_style => {
		const { container } = render(
			<FreehandNode
				{...nodeProps}
				data={{
					...node,
					stroke_style,
					stroke_width: undefined,
					color: 'default',
					opacity: 25,
				}}
			/>,
		);

		const visiblePath = container.querySelector('path[opacity]');
		expect(visiblePath).toHaveAttribute('stroke', whiteboardNodeStrokeColor);
		expect(visiblePath).toHaveAttribute('opacity', '0.25');
		expect(visiblePath).toHaveAttribute('stroke-width', '4');
	},
);

test('renders the smallest solid centerline with its requested stroke width', () => {
	const { container } = render(
		<FreehandNode {...nodeProps} data={{ ...node, stroke_width: SMALL_STROKE_WIDTH }} />,
	);
	const visiblePath = container.querySelector('path[stroke="#ff9200"]');
	expect(visiblePath).toHaveAttribute('fill', 'none');
	expect(visiblePath).toHaveAttribute('stroke-width', '2');
});

test('keeps strokes visible when an optional color is absent', () => {
	const { container } = render(
		<FreehandNode {...nodeProps} data={{ ...node, color: undefined }} />,
	);
	expect(container.querySelector('path[opacity]')).toHaveAttribute(
		'stroke',
		whiteboardNodeStrokeColor,
	);
});

test.each(['Solid', undefined] as const)(
	'preserves the appearance of saved legacy outlines with style %s',
	stroke_style => {
		const { container } = render(
			<FreehandNode
				{...nodeProps}
				data={{
					...node,
					data: 'M0,0 Q50,0 100,0 T100,2 50,2 0,2 Z',
					stroke_style,
					stroke_width: SMALL_STROKE_WIDTH,
				}}
			/>,
		);
		const visiblePath = container.querySelector('path[stroke="#ff9200"]');
		expect(visiblePath).toHaveAttribute('fill', '#ff9200');
		expect(visiblePath).toHaveAttribute('stroke-width', '0');
		expect(visiblePath).toHaveAttribute('d', 'M0,0 Q50,0 100,0 T100,2 50,2 0,2 Z');
	},
);
