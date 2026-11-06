import { Popover } from '@equinor/eds-core-react';
import { Button, Icon } from '@equinor/eds-core-react/next';
import { add } from '@equinor/eds-icons';
import { useRef, useState } from 'react';
import { useIssueForm } from '../../hooks/useIssueForm';
import { CreateIssueForm } from './CreateIssueForm';

export const CreateIssueButton = () => {
	const [isOpen, setIsOpen] = useState(false);
	const formMethods = useIssueForm({
		onSuccess: () => setIsOpen(false),
	});
	const referenceElement = useRef<HTMLButtonElement>(null);

	return (
		<>
			<Button
				ref={referenceElement}
				type='button'
				variant='secondary'
				onClick={() => setIsOpen(prev => !prev)}
			>
				<Icon data={add} />
				Create Issue
			</Button>
			<Popover
				open={isOpen}
				onClose={() => setIsOpen(false)}
				anchorEl={referenceElement.current}
				className='[&>div:last-child]:max-w-none!'
			>
				<Popover.Content className='relative w-[min(640px,90vw)]'>
					<CreateIssueForm formMethods={formMethods} onClose={() => setIsOpen(false)} />
				</Popover.Content>
			</Popover>
		</>
	);
};
