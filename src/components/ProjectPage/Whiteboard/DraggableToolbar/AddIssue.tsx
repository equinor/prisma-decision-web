import { useDraggable } from '@dnd-kit/react';
import { Button, Icon, Popover } from '@equinor/eds-core-react';
import { assignment_important } from '@equinor/eds-icons';
import { useHotkey } from '@tanstack/react-hotkeys';
import { useRef, useState } from 'react';
import { useSelectedProjectIssues } from '../../../../hooks/useSelectedProjectIssues';
import { Issue } from '../../../../validators';
import {
	IssueCard as IssueCardComponent,
	IssueCardContent,
	IssueCardHeader,
} from '../../../common/Cards/IssueCard';

export const AddIssue = () => {
	const [isOpen, setIsOpen] = useState(false);
	const referenceElement = useRef<HTMLButtonElement>(null);
	const issues = useSelectedProjectIssues();
	useHotkey('6', () => setIsOpen(!isOpen));
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
