import { Outlet } from 'react-router';
import { Toaster } from 'sonner';
import { SideBar } from './Sidebar';
import { TopBar } from './TopBar';

export const Layout = () => {
	return (
		<div className='grid h-screen grid-cols-[auto_1fr] grid-rows-[auto_1fr]'>
			<TopBar />
			<SideBar />
			<div className='relative h-full min-w-[320px] overflow-y-auto py-10'>
				<Outlet />
			</div>
			<Toaster />
		</div>
	);
};
