import { Button, TopBar as EdsTopBar, Icon, StarProgress } from '@equinor/eds-core-react';
import { sun } from '@equinor/eds-icons';
import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import useDarkMode from '../hooks/useDarkMode';
import { MoonIcon } from './common/MoonIcon';

export const TopBar = () => {
	const { toggleDarkMode, darkMode } = useDarkMode();
	const navigate = useNavigate();
	const isFetching = useIsFetching();
	const isMutating = useIsMutating();
	const isLoading = isFetching > 0 || isMutating > 0;

	return (
		<EdsTopBar sticky={false} className='col-span-2 pl-5!'>
			<EdsTopBar.Header
				className='flex! cursor-pointer items-center! justify-center'
				onClick={() => navigate('/')}
			>
				<div className='flex h-8 w-8 items-center justify-center rounded-md bg-teal-600 text-[14px] font-semibold text-white'>
					DOT
				</div>
				Decision Optimization Tool
				{isLoading && (
					<div className='flex items-center pb-2'>
						<StarProgress size={24} />
					</div>
				)}
			</EdsTopBar.Header>
			<EdsTopBar.Actions className='flex items-center gap-4'>
				<Button
					variant='ghost_icon'
					onClick={toggleDarkMode}
					onMouseDown={e => e.stopPropagation()}
				>
					{darkMode ? <Icon data={sun}>dark mode</Icon> : <MoonIcon />}
				</Button>
			</EdsTopBar.Actions>
		</EdsTopBar>
	);
};
