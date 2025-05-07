import { Outlet } from 'react-router';
import { TopBar } from './TopBar';
import { SideBar } from './Sidebar';

export const Layout = () => {
	return (
		<div className='grid h-screen grid-cols-[auto_1fr] grid-rows-[auto_1fr]'>
			<TopBar />
			<SideBar />
			<div className='h-full min-w-[320px] overflow-y-auto py-10'>
				<Outlet />
			</div>
		</div>
	);
};
