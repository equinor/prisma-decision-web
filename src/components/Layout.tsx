import { useState } from 'react';
import { Outlet } from 'react-router';
import { Toaster } from 'sonner';
import { ChatPanel } from './ChatPanel';
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
	const [chatOpen, setChatOpen] = useState(false);
	useGetIssues();
	useGetEdges();
	useGetInfluenceNodes();
	useGetStrategies();
	useGetObjectives();
	useGetProbabilityTables();
	useGetRestrictionTables();
	useGetUtilityTables();
	return (
		<div
			className={`grid h-screen grid-cols-[auto_1fr_auto] grid-rows-[auto_1fr] ${
				chatOpen ? '[--chat-panel-width:24rem]' : '[--chat-panel-width:0rem]'
			}`}
		>
			<TopBar chatOpen={chatOpen} onToggleChat={() => setChatOpen(prev => !prev)} />
			<SideBar />
			<div className='relative h-full min-w-[320px] overflow-y-auto py-10'>
				<Outlet />
			</div>
			<ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
			<Toaster />
		</div>
	);
};
