import { Autocomplete, Button, Icon, Popover, TextField } from '@equinor/eds-core-react';
import { add, close } from '@equinor/eds-icons';
import { useRef, useState } from 'react';
import { useSelectedScenario } from '../../hooks/useSelectedScenario';

export const CreateStrategyForm = () => {
	const [isOpen, setIsOpen] = useState(false);
	const selectedScenario = useSelectedScenario();
	const objectives = selectedScenario?.objectives || [];
	const referenceElement = useRef<HTMLButtonElement>(null);

	return (
		<>
			<Button
				ref={referenceElement}
				variant='outlined'
				onClick={() => setIsOpen(prev => !prev)}
			>
				<Icon data={add} />
				Create Strategy
			</Button>
			<Popover
				open={isOpen}
				onClick={() => setIsOpen(true)}
				anchorEl={referenceElement.current}
			>
				<Popover.Content className='relative w-[min(543px,_90vw)]'>
					<form className='flex flex-col items-start gap-4 rounded-sm'>
						<div className='w-full cursor-pointer pr-16'>
							<h2 className='text-2xl font-semibold'>Create Strategy</h2>
							<p className='text-text-tertiary'>
								Define a new strategy for the project
							</p>
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
						<TextField label='Strategy Name' placeholder='Enter strategy name...' />
						<TextField label='Rationale' placeholder='Enter rationale...' />
						<Autocomplete
							label='Objectives'
							placeholder='Select objective...'
							autoWidth
							className='w-full'
							options={objectives}
							optionLabel={objective => objective.name}
						/>
						<Button className='md:self-end' type='submit'>
							{'Add Strategy'}
						</Button>
					</form>
				</Popover.Content>
			</Popover>
		</>
	);
};
