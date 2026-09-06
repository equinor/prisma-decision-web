import { DragDropProvider, DragEndEvent, DragOverlay, useDraggable } from '@dnd-kit/react';
import { Button, Icon, Popover } from '@equinor/eds-core-react';
import { assignment_important } from '@equinor/eds-icons';
import { useHotkey } from '@tanstack/react-hotkeys';
import { useRef, useState } from 'react';

import { useReactFlow } from '@xyflow/react';
import { useCreateWhiteboardNode } from '../../../hooks/api/useCreateWhiteboardNode ';
import { useSelectedProjectIssues } from '../../../hooks/useSelectedProjectIssues';
import useSelectedWhiteboardSheet from '../../../hooks/useSelectedWhiteboardSheet';
import { Issue } from '../../../validators';
import { useSelectedProject } from '../../ProjectPage/ProjectContext';
import { IssueCardContent, IssueCardHeader } from '../Cards/IssueCard';
import { IssueCard as IssueCardComponent } from '../Cards/IssueCard';

export const AddIssue = () => {
	const [isOpen, setIsOpen] = useState(false);
	const referenceElement = useRef<HTMLButtonElement>(null);
	const issues = useSelectedProjectIssues();
	useHotkey('6', () => setIsOpen(!isOpen));

	const { screenToFlowPosition } = useReactFlow();
	const { mutate: createWhiteboardNode } = useCreateWhiteboardNode();

	const selectedProject = useSelectedProject();
	const sheet = useSelectedWhiteboardSheet();

	const onDragEnd = (e: DragEndEvent) => {
		const sourceId = e.operation.source?.data.issue.id;
		if (!sourceId) return;

		const { x, y } = e.operation.position.current;
		const translatedBounds = e.operation.shape?.current.boundingRectangle;
		const nodeWidth = translatedBounds?.width ?? 0;
		const nodeHeight = translatedBounds?.height ?? 0;

		const center = screenToFlowPosition({
			x: translatedBounds ? translatedBounds.left + nodeWidth / 2 : x,
			y: translatedBounds ? translatedBounds.top + nodeHeight / 2 : y,
		});
		createWhiteboardNode({
			id: crypto.randomUUID(),
			x_position: center.x - nodeWidth / 2,
			y_position: center.y - nodeHeight / 2,
			width: 0,
			height: 0,
			type: 'Issue',
			project_id: selectedProject.id,
			data: sourceId,
			rotation: 0,
			board_sheet_id: sheet.id,
			zIndex: 0,
		});
	};

	if (issues.length === 0) return null;
	return (
		<DragDropProvider onDragEnd={onDragEnd}>
			<Button.Toggle
				onChange={() => setIsOpen(!isOpen)}
				selectedIndexes={isOpen ? [0] : []}
				title='Add issue'
			>
				<Button
					ref={referenceElement}
					onClick={() => setIsOpen(!isOpen)}
					variant='outlined'
					className='relative px-1.5!'
				>
					<Icon data={assignment_important} />
					<p className='absolute right-0.5 -bottom-0.5 text-xs'>6</p>
				</Button>
			</Button.Toggle>
			<Popover
				open={isOpen}
				anchorEl={referenceElement.current}
				onClose={() => setIsOpen(false)}
			>
				<Popover.Content className='bg-background-medium! max-w-auto! max-h-200 p-0!'>
					<div className='bg-background-medium grid grid-cols-1 gap-2.5 p-2'>
						{issues.map(issue => (
							<IssueCard key={issue.id} issue={issue} />
						))}
					</div>
				</Popover.Content>
			</Popover>
			<DragOverlay dropAnimation={null}>
				{source => {
					return (
						<IssueCardComponent issue={source.data.issue} className='w-64'>
							<IssueCardHeader />
							<IssueCardContent />
						</IssueCardComponent>
					);
				}}
			</DragOverlay>
		</DragDropProvider>
	);
};

const IssueCard = ({ issue }: { issue: Issue }) => {
	const { ref } = useDraggable({
		id: issue?.id,
		type: issue?.type,
		data: {
			issue,
		},
	});

	return (
		<div ref={ref}>
			<IssueCardComponent issue={issue} className='w-64'>
				<IssueCardHeader />
				<IssueCardContent />
			</IssueCardComponent>
		</div>
	);
};
