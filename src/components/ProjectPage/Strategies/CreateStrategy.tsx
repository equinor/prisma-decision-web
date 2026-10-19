import { Button, TextField } from '@equinor/eds-core-react/next';
import { FormProvider } from 'react-hook-form';
import { useStrategyForm } from '../../../hooks/useStrategyForm';
import { StrategyIconColorPicker } from './StrategyIconColorPicker';
import { StrategyIconPicker } from './StrategyIconPicker';

export const CreateStrategy = () => {
	const { formMethods, handleSubmit, isPending } = useStrategyForm();

	return (
		<FormProvider {...formMethods}>
			<form aria-label='Create strategy' className='w-full' onSubmit={handleSubmit}>
				<fieldset
					disabled={isPending}
					className='grid w-full items-start gap-3 [@media(min-width:1130px)]:grid-cols-[minmax(180px,1fr)_minmax(240px,1.4fr)_auto_auto_auto]'
				>
					<TextField
						aria-label='Strategy name'
						placeholder='Strategy name (required)'
						{...formMethods.register('name')}
					/>
					<TextField
						aria-label='Rationale'
						placeholder='Rationale (required)'
						{...formMethods.register('rationale')}
					/>
					<StrategyIconColorPicker className='mt-0!' />
					<StrategyIconPicker className='mt-0!' />
					<Button type='submit' disabled={isPending} aria-busy={isPending}>
						Create strategy
					</Button>
				</fieldset>
			</form>
		</FormProvider>
	);
};
