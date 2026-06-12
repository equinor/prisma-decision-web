import { Button, TopBar as EdsTopBar, Icon, StarProgress } from '@equinor/eds-core-react';
import { sun } from '@equinor/eds-icons';
import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import useDarkMode from '../hooks/useDarkMode';
import { useSelectedProject } from '../hooks/useSelectedProject';
import { MoonIcon } from './common/MoonIcon';

export const TopBar = () => {
	const { toggleDarkMode, darkMode } = useDarkMode();
	const navigate = useNavigate();
	const isFetching = useIsFetching();
	const isMutating = useIsMutating();
	const isLoading = isFetching > 0 || isMutating > 0;
	const selectedProject = useSelectedProject();

	return (
		<EdsTopBar sticky={false} className='col-span-2 border-b-0! pl-3.5!'>
			<EdsTopBar.Header className='flex! items-center! justify-center'>
				<div
					onClick={() => navigate('/')}
					className='flex cursor-pointer items-center justify-center'
				>
					<img src='/icon.png' alt='' className='size-12' />
					<h1 className='font- text-lg'>Prisma</h1>
				</div>
				{selectedProject && (
					<>
						<div className='bg-background-medium m-0! h-8 w-0.5' />
						{selectedProject?.name}
					</>
				)}
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
