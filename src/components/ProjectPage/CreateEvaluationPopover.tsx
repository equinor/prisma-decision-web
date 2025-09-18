import { Button, Icon, Popover } from '@equinor/eds-core-react';
import { add, close } from '@equinor/eds-icons';
import { useRef, useState } from 'react';
import { useEvaluations } from '../../hooks/useEvaluations';

export const CreateEvaluationPopover = () => {
	const [isOpen, setIsOpen] = useState(false);
	const { addDemoEvaluation } = useEvaluations();
	const anchorRef = useRef<HTMLButtonElement>(null);

	const onCreate = () => {
		addDemoEvaluation();
		setIsOpen(false);
	};

	return (
		<>
			<Button ref={anchorRef} variant='outlined' onClick={() => setIsOpen(p => !p)}>
				<Icon data={add} />
				Start Evaluation
			</Button>
			<Popover open={isOpen} onClick={() => setIsOpen(true)} anchorEl={anchorRef.current}>
				<Popover.Content className='relative w-[min(480px,_90vw)]'>
					<div className='flex flex-col gap-4 pr-12'>
						<div>
							<h2 className='text-2xl font-semibold'>Start Evaluation</h2>
							<p className='text-text-tertiary'>
								This is a placeholder. Clicking &quot;Create demo&quot; will add a
								hardcoded evaluation.
							</p>
						</div>

						<div className='flex gap-2'>
							<Button onClick={onCreate}>Create demo</Button>
							<Button variant='outlined' onClick={() => setIsOpen(false)}>
								Cancel
							</Button>
						</div>

						<Button
							variant='ghost_icon'
							className='absolute! top-2 right-2'
							onClick={e => {
								e.stopPropagation();
								setIsOpen(false);
							}}
						>
							<Icon data={close} />
						</Button>
					</div>
				</Popover.Content>
			</Popover>
		</>
	);
};
