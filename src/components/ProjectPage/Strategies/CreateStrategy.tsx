import {
	Button,
	CircularProgress,
	Icon,
	Popover,
	TextField,
	Textarea,
} from '@equinor/eds-core-react';
import { close } from '@equinor/eds-icons';
import { useRef, useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { useStrategyForm } from '../../../hooks/useStrategyForm';
import { StrategyIconPicker } from './StrategyIconPicker';

export const CreateStrategy = () => {
	const { formMethods, handleSubmit, isPending } = useStrategyForm();
	const referenceElement = useRef<HTMLButtonElement>(null);
	const [isOpen, setIsOpen] = useState(false);

	return (
		<FormProvider {...formMethods}>
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
				placement='bottom-end'
			>
				<Popover.Content>
					<form
						className='flex w-[min(85vw,500px)] flex-col items-start gap-4 rounded-sm'
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
								Create strategies for your project decisions
							</p>
						</div>
						<div className='grid w-full grid-cols-[auto_1fr] gap-2'>
							<StrategyIconPicker />
							<TextField
								{...formMethods.register('name')}
								placeholder='Enter strategy name...'
								label='Name'
							/>
						</div>
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
		</FormProvider>
	);
};
