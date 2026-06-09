import {
	Button,
	CircularProgress,
	Dialog,
	DialogContent,
	Icon,
	TextField,
	Textarea,
	Tooltip,
} from '@equinor/eds-core-react';
import { close, edit } from '@equinor/eds-icons';
import { useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { Strategy } from '../../../validators';
import { useStrategyForm } from '../../../hooks/useStrategyForm';
import { StrategyIconPicker } from './StrategyIconPicker';

export const EditStrategy = ({ strategy }: { strategy: Strategy }) => {
	const { formMethods, handleSubmit, isPending } = useStrategyForm(strategy);
	const [isOpen, setIsOpen] = useState(false);

	return (
		<FormProvider {...formMethods}>
			<Tooltip title='Edit strategy'>
				<Button variant='ghost_icon' onClick={() => setIsOpen(true)}>
					<Icon data={edit} />
				</Button>
			</Tooltip>
			{isOpen && (
				<Dialog
					data-no-dnd
					open
					className='fixed top-1/2 left-1/2 max-h-[90vh]
					 w-[min(700px,90vw)]! -translate-x-1/2 -translate-y-1/2 transform overflow-auto'
				>
					<DialogContent>
						<form
							className='flex w-full flex-col items-start gap-4'
							onSubmit={e => {
								handleSubmit(e);
								setIsOpen(false);
							}}
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
								<h2 className='text-2xl font-semibold'>Edit Strategy</h2>
								<p className='text-text-tertiary'>
									Edit strategy name, icon and rationale
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
							<Button className='w-max self-end' type='submit' disabled={isPending}>
								{isPending ? <CircularProgress size={16} /> : 'Save'}
							</Button>
						</form>
					</DialogContent>
				</Dialog>
			)}
		</FormProvider>
	);
};
