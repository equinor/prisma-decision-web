import { SideBar as EdsSideBar, Menu } from '@equinor/eds-core-react';
import { add } from '@equinor/eds-icons';
import { useState } from 'react';
import { EquinorStar } from './EquinorStar';

export const SideBar = () => {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
	return (
		<EdsSideBar className='h-[calc(100vh-64px)] !overflow-x-hidden !border-r-0'>
			<EdsSideBar.Content>
				<EdsSideBar.Button
					ref={setAnchorEl}
					label='Add new project'
					className='[&>button]:rounded-full!'
					onClick={() => setIsOpen(true)}
					icon={add}
				/>
				<Menu anchorEl={anchorEl} open={isOpen} onClose={() => setIsOpen(false)}>
					<Menu.Item>Create new project</Menu.Item>
					<Menu.Item>Import project</Menu.Item>
				</Menu>
			</EdsSideBar.Content>
			<EdsSideBar.Footer>
				<EdsSideBar.Toggle className='[&_svg]:fill-primary-resting' />
				<div className='flex items-center justify-center py-4'>
					<EquinorStar />
				</div>
			</EdsSideBar.Footer>
		</EdsSideBar>
	);
};
