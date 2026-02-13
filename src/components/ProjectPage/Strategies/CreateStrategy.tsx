import {
	Button,
	Popover,
	Icon,
	TextField,
	Textarea,
	CircularProgress,
} from '@equinor/eds-core-react';
import { useRef, useState } from 'react';
import { useStrategyForm } from '../../../hooks/useStrategyForm';
import { close } from '@equinor/eds-icons';

export const CreateStrategy = () => {
	const { formMethods, handleSubmit, isPending } = useStrategyForm();
	const referenceElement = useRef<HTMLButtonElement>(null);
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<Button
				ref={referenceElement}
				variant='outlined'
				onClick={() => setIsOpen(prev => !prev)}
			>
				Create Strategy
			</Button>
			<Popover
				open={isOpen}
				onClose={() => setIsOpen(false)}
				anchorEl={referenceElement.current}
			>
				<Popover.Content>
					<form
						className='flex flex-col items-start gap-4 rounded-sm'
						onSubmit={handleSubmit}
					>
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
						<div className='w-full pr-16'>
							<h2 className='text-2xl font-semibold'>Create Strategy</h2>
							<p className='text-text-tertiary'>
								Create strategies for your decision optimization project
							</p>
						</div>
						<TextField
							{...formMethods.register('name')}
							placeholder='Enter strategy name...'
							label='Name'
						/>
						<Textarea
							{...formMethods.register('description')}
							placeholder='Enter strategy description...'
							label='Description'
						/>
						<Textarea
							{...formMethods.register('rationale')}
							placeholder='Enter strategy rationale...'
							label='Rationale'
						/>
						<Button className='md:self-end' type='submit' disabled={isPending}>
							{isPending ? <CircularProgress size={16} /> : 'Add Strategy'}
						</Button>
					</form>
				</Popover.Content>
			</Popover>
		</>
	);
};
