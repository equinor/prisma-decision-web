import { Button, CircularProgress, Icon, Popover, TextField } from '@equinor/eds-core-react';
import { add, close } from '@equinor/eds-icons';
import { ErrorMessage } from '@hookform/error-message';
import { useState } from 'react';
import { useStakeholderMatrixForm } from '../../../hooks/useStakeholderMatrixForm';
import { FormErrorMessage } from '../../common/FormErrorMessage';

type CreateStakeholderMatrixProps = {
	/** Button text; the popover is anchored to this button. */
	label?: string;
};

export const CreateStakeholderMatrix = ({
	label = 'Add stakeholder',
}: CreateStakeholderMatrixProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
		isPending,
	} = useStakeholderMatrixForm({ onSuccess: () => setIsOpen(false) });

	const closePopover = () => {
		setIsOpen(false);
		reset();
	};

	return (
		<>
			<Button
				variant='outlined'
				ref={setAnchorEl}
				aria-expanded={isOpen}
				aria-haspopup='dialog'
				onClick={() => setIsOpen(prev => !prev)}
			>
				<Icon data={add} />
				{label}
			</Button>
			<Popover
				open={isOpen}
				anchorEl={anchorEl}
				placement='bottom-end'
				trapFocus
				onClose={closePopover}
			>
				<Popover.Content className='w-[min(360px,90vw)]'>
					{/* Name is first in DOM order so the Popover focus trap lands on it. */}
					<form className='flex flex-col gap-4' onSubmit={handleSubmit}>
						<div className='pr-12'>
							<h2 className='text-2xl font-bold'>Add stakeholder</h2>
							<p className='text-text-tertiary text-base'>
								New stakeholders start in the middle of the matrix. Drag them into
								place.
							</p>
						</div>
						<div>
							<TextField
								label='Name'
								placeholder='Enter stakeholder name...'
								{...register('stakeholder_name')}
							/>
							<ErrorMessage
								as={FormErrorMessage}
								name='stakeholder_name'
								errors={errors}
							/>
						</div>
						<div>
							<TextField
								label='Role'
								placeholder='Enter role or organization...'
								{...register('stakeholder_role')}
							/>
							<ErrorMessage
								as={FormErrorMessage}
								name='stakeholder_role'
								errors={errors}
							/>
						</div>
						<Button className='w-max self-end' type='submit' disabled={isPending}>
							{isPending ? <CircularProgress size={16} /> : 'Add stakeholder'}
						</Button>
						<Button
							type='button'
							variant='ghost_icon'
							className='absolute! top-2 right-2'
							aria-label='Close'
							onClick={closePopover}
						>
							<Icon data={close} />
						</Button>
					</form>
				</Popover.Content>
			</Popover>
		</>
	);
};
