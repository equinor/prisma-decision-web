import {
	DragDropProvider,
	DragEndEvent,
	DragOverlay,
	PointerSensor,
	useDraggable,
} from '@dnd-kit/react';
import { Button, Icon } from '@equinor/eds-core-react';
import { Composite, CompositeItem, CompositeProvider } from '@ariakit/react';
import { add, assignment_important } from '@equinor/eds-icons';
import { useHotkey } from '@tanstack/react-hotkeys';
import { useReactFlow } from '@xyflow/react';
import { useState } from 'react';
import { useCreateWhiteboardNodes } from '../../../hooks/api/useCreateWhiteboardNodes';
import { useSelectedProjectIssues } from '../../../hooks/useSelectedProjectIssues';
import useSelectedWhiteboardSheet from '../../../hooks/useSelectedWhiteboardSheet';
import { Issue } from '../../../validators';
import { useSelectedProject } from '../../ProjectPage/ProjectContext';
import {
	IssueCard as IssueCardComponent,
	IssueCardContent,
	IssueCardHeader,
} from '../Cards/IssueCard';
import { ToolbarPopoverButton } from './Toolbar';

const issuesPerRow = 4;
const horizontalSpacing = 300;
const verticalSpacing = 200;

export const AddIssue = () => {
	const [isOpen, setIsOpen] = useState(false);
	const issues = useSelectedProjectIssues();
	const selectedProject = useSelectedProject();
	const sheet = useSelectedWhiteboardSheet();
	const { screenToFlowPosition } = useReactFlow();
	const { mutate: createWhiteboardNodes, isPending } = useCreateWhiteboardNodes({
		onSuccess: () => setIsOpen(false),
	});
	useHotkey('6', () => setIsOpen(open => !open));

	const addAllIssues = () => {
		if (!sheet) return;
		createWhiteboardNodes(
			issues.map((issue, index) => ({
				id: crypto.randomUUID(),
				board_sheet_id: sheet.id,
				project_id: selectedProject.id,
				height: 0,
				width: 0,
				x_position: (index % issuesPerRow) * horizontalSpacing,
				y_position: Math.floor(index / issuesPerRow) * verticalSpacing,
				rotation: 0,
				data: issue.id,
				type: 'Issue' as const,
				zIndex: 0,
			})),
		);
	};

	const addIssue = (
		issue: Issue,
		position = screenToFlowPosition({
			x: window.innerWidth / 2,
			y: window.innerHeight / 2,
		}),
	) => {
		if (!sheet) return;
		createWhiteboardNodes([
			{
				id: crypto.randomUUID(),
				board_sheet_id: sheet.id,
				project_id: selectedProject.id,
				height: 0,
				width: 0,
				x_position: position.x,
				y_position: position.y,
				rotation: 0,
				data: issue.id,
				type: 'Issue',
				zIndex: 0,
			},
		]);
	};

	const onDragEnd = (event: DragEndEvent) => {
		const issue = event.operation.source?.data.issue;
		if (event.canceled || !issue || !sheet) return;

		const bounds = event.operation.shape?.current.boundingRectangle;
		const position = screenToFlowPosition(
			bounds ? { x: bounds.left, y: bounds.top } : event.operation.position.current,
		);
		addIssue(issue, position);
	};

	if (issues.length === 0) return null;
	return (
		<DragDropProvider onDragEnd={onDragEnd}>
			<CompositeProvider orientation='vertical' focusLoop>
				<ToolbarPopoverButton
					icon
					tone='accent'
					open={isOpen}
					onOpenChange={setIsOpen}
					shortcut='6'
					tooltip='Add Issue'
					trigger={<Icon data={assignment_important} />}
					contentClassName='bg-background-medium! max-w-auto! max-h-200 p-0!'
				>
					<Composite
						aria-label='Add Issue'
						render={
							<div className='bg-background-medium grid grid-cols-1 gap-2.5 p-2' />
						}
					>
						<CompositeItem
							autoFocus
							render={<Button variant='outlined' />}
							disabled={isPending}
							onClick={addAllIssues}
						>
							<Icon data={add} />
							{isPending ? 'Adding issues' : 'Add all issues'}
						</CompositeItem>
						{issues.map(issue => (
							<IssueCard
								key={issue.id}
								issue={issue}
								onClick={() => addIssue(issue)}
							/>
						))}
					</Composite>
				</ToolbarPopoverButton>
			</CompositeProvider>
			<DragOverlay dropAnimation={null}>
				{source => (
					<IssueCardComponent issue={source.data.issue} className='w-64'>
						<IssueCardHeader />
						<IssueCardContent />
					</IssueCardComponent>
				)}
			</DragOverlay>
		</DragDropProvider>
	);
};

const IssueCard = ({ issue, onClick }: { issue: Issue; onClick: () => void }) => {
	const { ref } = useDraggable({
		id: issue?.id,
		type: issue?.type,
		sensors: [PointerSensor],
		data: {
			issue,
		},
	});

	return (
		<CompositeItem
			ref={ref}
			onClick={onClick}
			typeaheadText={issue.name}
			className='data-active-item:outline-primary-resting rounded-sm border-0 bg-transparent p-0 text-left data-active-item:outline-2'
		>
			<IssueCardComponent issue={issue} className='w-64'>
				<IssueCardHeader />
				<IssueCardContent />
			</IssueCardComponent>
		</CompositeItem>
	);
};
