import { useDraggable } from '@dnd-kit/react';
import { Button, Icon, Popover } from '@equinor/eds-core-react';
import { add, assignment_important } from '@equinor/eds-icons';
import { useHotkey } from '@tanstack/react-hotkeys';
import { useRef, useState } from 'react';
import { useCreateWhiteboardNodes } from '../../../../hooks/api/useCreateWhiteboardNodes';
import { useSelectedProjectIssues } from '../../../../hooks/useSelectedProjectIssues';
import useSelectedWhiteboardSheet from '../../../../hooks/useSelectedWhiteboardSheet';
import { Issue } from '../../../../validators';
import {
	IssueCard as IssueCardComponent,
	IssueCardContent,
	IssueCardHeader,
} from '../../../common/Cards/IssueCard';
import { useSelectedProject } from '../../ProjectContext';

const issuesPerRow = 4;
const horizontalSpacing = 300;
const verticalSpacing = 200;

export const AddIssue = () => {
	const [isOpen, setIsOpen] = useState(false);
	const referenceElement = useRef<HTMLButtonElement>(null);
	const issues = useSelectedProjectIssues();
	const selectedProject = useSelectedProject();
	const sheet = useSelectedWhiteboardSheet();
	const { mutate: createWhiteboardNodes, isPending } = useCreateWhiteboardNodes({
		onSuccess: () => setIsOpen(false),
	});
	useHotkey('6', () => setIsOpen(!isOpen));

	const addAllIssues = () => {
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
			})),
		);
	};

	if (issues.length === 0) return null;
	return (
		<>
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
						<Button variant='outlined' disabled={isPending} onClick={addAllIssues}>
							<Icon data={add} />
							{isPending ? 'Adding issues' : 'Add all issues'}
						</Button>
						{issues.map(issue => (
							<IssueCard key={issue.id} issue={issue} />
						))}
					</div>
				</Popover.Content>
			</Popover>
		</>
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
