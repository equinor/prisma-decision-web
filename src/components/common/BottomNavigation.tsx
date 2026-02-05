import { Button, Icon } from '@equinor/eds-core-react';
import { arrow_back, arrow_forward } from '@equinor/eds-icons';
import { useLocation, useNavigate } from 'react-router';
import { useSelectedProject } from '../../hooks/useSelectedProject';

const NAV_STEPS = [
	{ path: '', nextLabel: 'Set Objectives' },
	{ path: '/objectives', nextLabel: 'View Issues' },
	{ path: '/issues', nextLabel: 'Create Strategies' },
	{ path: '/strategies', nextLabel: 'Create Influence Diagram' },
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
							? 'Project Details'
							: `${prevStep.path.replace('/', '').split('-').join(' ')}`,
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

export const BottomNavigation = () => {
	const navigate = useNavigate();
	const selectedProject = useSelectedProject();
	const basePath = `/project/${selectedProject?.id}/`;
	const pathname = useLocation().pathname;

	const hideNavigation = !selectedProject?.id || pathname === '/';

	const { back, next } = getNavigation(pathname, basePath);
	if (hideNavigation) {
		return null;
	}
	return (
		<>
			{!back.invisible && (
				<div className='bg-background-default shadow-tile fixed! bottom-6 left-26 rounded-md p-2 **:capitalize!'>
					<Button variant='outlined' onClick={() => navigate(back.to)}>
						<Icon data={arrow_back} />
						{back.label}
					</Button>
				</div>
			)}
			{!next.invisible && (
				<div className='bg-background-default shadow-tile fixed! right-6 bottom-6 rounded-md p-2'>
					<Button variant='outlined' onClick={() => navigate(next.to)}>
						{next.label}
						<Icon data={arrow_forward} />
					</Button>
				</div>
			)}
		</>
	);
};
