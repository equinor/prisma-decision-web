import { Outlet, useLocation } from 'react-router';
import { TopBar } from './TopBar';
import { SideBar } from './Sidebar';
import { BottomNavigation } from './common/BottomNavigation';
import { useSelectedProject } from '../hooks/useSelectedProject';

const NAV_STEPS = [
	{ path: '', nextLabel: 'Set Objectives' },
	{ path: '/objectives', nextLabel: 'View Issues' },
	{ path: '/issues', nextLabel: 'Create Influence Diagram' },
	{
		path: '/influence-diagram',
		nextLabel: 'Calculate Decision Tree',
	},
	{ path: '/decision-tree', nextLabel: 'View Solution Tree' },
	{ path: '/solution-tree', nextLabel: '' },
] as const;

const getNavigation = (pathname: string, basePath: string) => {
	const currentIndex = NAV_STEPS.findIndex(step =>
		step.path ? pathname.endsWith(step.path) : pathname === basePath,
	);

	if (currentIndex === -1) {
		return {
			back: { label: '', to: '', invisible: true },
			next: { label: '', to: '', invisible: true },
		};
	}

	const prevStep = NAV_STEPS[currentIndex - 1];
	const nextStep = NAV_STEPS[currentIndex + 1];
	const currentStep = NAV_STEPS[currentIndex];

	return {
		back: prevStep
			? {
					label:
						prevStep.path === ''
							? 'Back to Project Details'
							: `Back to ${prevStep.path.replace('/', '')}`,
					to: `${basePath}${prevStep.path}`,
					invisible: false,
				}
			: { label: '', to: '', invisible: true },
		next: nextStep
			? {
					label: currentStep.nextLabel,
					to: `${basePath}${nextStep.path}`,
					invisible: false,
				}
			: { label: '', to: '', invisible: true },
	};
};

export const Layout = () => {
	const selectedProject = useSelectedProject();
	const basePath = `/project/${selectedProject?.id}/`;
	const pathname = useLocation().pathname;

	const hideNavigation = !selectedProject?.id || pathname === '/';
	const { back, next } = getNavigation(pathname, basePath);

	return (
		<div className='grid h-screen grid-cols-[auto_1fr] grid-rows-[auto_1fr]'>
			<TopBar />
			<SideBar />
			<div className='relative h-full min-w-[320px] overflow-y-auto py-10'>
				<Outlet />
			</div>
			{!hideNavigation && <BottomNavigation back={back} next={next} />}
		</div>
	);
};
