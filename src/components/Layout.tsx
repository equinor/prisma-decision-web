import { Outlet } from 'react-router';
import { Toaster } from 'sonner';
import { SideBar } from './Sidebar';
import { TopBar } from './TopBar';
import { useGetInfluenceNodes } from '../hooks/api/useGetInfluenceNodes';
import { useGetEdges } from '../hooks/api/useGetEdges';
import { useGetIssues } from '../hooks/api/useGetIssues';
import { useGetObjectives } from '../hooks/api/useGetObjectives';
import { useGetStrategies } from '../hooks/api/useGetStrategies';
import { useGetProbabilityTables } from '../hooks/api/useGetProbabilityTables';
import { useGetRestrictionTables } from '../hooks/api/useGetRestrictionTables';
import { useGetUtilityTables } from '../hooks/api/useGetUtilityTables';

export const Layout = () => {
	useGetIssues();
	useGetEdges();
	useGetInfluenceNodes();
	useGetStrategies();
	useGetObjectives();
	useGetProbabilityTables();
	useGetRestrictionTables();
	useGetUtilityTables();
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
