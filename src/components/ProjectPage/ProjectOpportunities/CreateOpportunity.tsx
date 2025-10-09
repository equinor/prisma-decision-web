import { Button, Icon, Popover, TextField } from '@equinor/eds-core-react';
import { add, close } from '@equinor/eds-icons';
import { ErrorMessage } from '@hookform/error-message';
import { useOppportunityForm } from '../../../hooks/useOppportunityForm';
import { FormErrorMessage } from '../../common/FormErrorMessage';
import { useState, useRef } from 'react';

export const CreateOpportunity = () => {
	const [isOpen, setIsOpen] = useState(false);
	const referenceElement = useRef<HTMLButtonElement>(null);
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useOppportunityForm(() => setIsOpen(false));

	return (
		<>
			<Button
				ref={referenceElement}
				variant='outlined'
				onClick={() => setIsOpen(prev => !prev)}
			>
				<Icon data={add} />
				Create Opportunity
			</Button>
			<Popover
				open={isOpen}
				onClose={() => setIsOpen(false)}
				anchorEl={referenceElement.current}
			>
				<Popover.Content className='relative w-[min(520px,_90vw)]'>
					<form className='grid w-full grid-cols-1 gap-4' onSubmit={handleSubmit}>
						<div className='w-full cursor-pointer pr-16'>
							<h2 className='text-2xl font-semibold'>Create Opportunity</h2>
							<p className='text-text-tertiary'>
								Add statements that describe the opportunity or problem this project
								addresses
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
						<div>
							<TextField
								label='Description'
								multiline
								rows={4}
								placeholder='Enter opportunity description...'
								{...register('description')}
							/>
							<ErrorMessage
								as={FormErrorMessage}
								name='description'
								errors={errors}
							/>
						</div>
						<Button className=' w-max justify-self-end' type='submit'>
							<Icon data={add} />
							Add
						</Button>
					</form>
				</Popover.Content>
			</Popover>
		</>
	);
};
