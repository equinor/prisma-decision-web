import { Button, TopBar as EdsTopBar, Icon } from '@equinor/eds-core-react';
import { sun } from '@equinor/eds-icons';
import { useNavigate } from 'react-router';
import useDarkMode from '../hooks/useDarkMode';

export const TopBar = () => {
	const toggleDarkMode = useDarkMode();
	const navigate = useNavigate();

	return (
		<EdsTopBar sticky={false} className='col-span-2 pl-4.5!'>
			<EdsTopBar.Header className='cursor-pointer' onClick={() => navigate('/')}>
				DOT
			</EdsTopBar.Header>
			<EdsTopBar.Actions className='flex gap-4'>
				<Button
					variant='ghost_icon'
					onClick={toggleDarkMode}
					onMouseDown={e => e.stopPropagation()}
				>
					<Icon data={sun}>dark mode</Icon>
				</Button>
			</EdsTopBar.Actions>
		</EdsTopBar>
	);
};
