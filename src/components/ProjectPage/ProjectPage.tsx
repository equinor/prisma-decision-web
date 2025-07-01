import { Button, Icon } from '@equinor/eds-core-react';
import { view_column, view_list } from '@equinor/eds-icons';
import { useLocalStorage } from '@uidotdev/usehooks';
import { createContext, useContext, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import { useGetProjects } from '../../hooks/api/useGetProjects';
import { useSelectedProject } from '../../hooks/useSelectedProject';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { NetworkIcon } from '../common/NetworkIcon';

export type Issue = {
	name: string;
	description: string;
	id: string;
	type: string;
	position?: { x: number; y: number };
};

const IssuesContext = createContext<{
	issues: Record<string, Issue[]>;
	setIssues: React.Dispatch<React.SetStateAction<Record<string, Issue[]>>>;
} | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useIssuesContext = () => {
	const context = useContext(IssuesContext);
	if (!context) throw new Error('useIssuesContext must be used within a IssuesContext');
	return context;
};

export const ProjectPage = () => {
	const location = useLocation();
	const [issues, setIssues] = useState(defaultIssues);
	const [issueView, setIssuesView] = useLocalStorage('issuesView', 'list');
	const showIssuesView = location.pathname.includes('issues');
	const selectedProject = useSelectedProject();
	const { isLoading } = useGetProjects();
	let activeView = 0;
	if (issueView === 'table') activeView = 1;
	if (issueView === 'diagram') activeView = 2;
	if (isLoading) return <LoadingSpinner />;
	if (!selectedProject) return;

	return (
		<IssuesContext.Provider
			value={{
				issues,
				setIssues,
			}}
		>
			<div className='mx-auto w-[min(1600px,_90%)]'>
				<div className='flex flex-col gap-6'>
					<div className='max-w-[1000px]'>
						<h1 className='text-3xl font-bold'>{selectedProject.name}</h1>
					</div>
					<div className='flex justify-between'>
						<Button.Toggle selectedIndexes={[showIssuesView ? 1 : 0]}>
							<Button as={Link} to='/project/1'>
								Project Details
							</Button>
							<Button as={Link} to='issues'>
								Issues
							</Button>
						</Button.Toggle>
						{showIssuesView && (
							<Button.Toggle selectedIndexes={[activeView]}>
								<Button onClick={() => setIssuesView('list')}>
									<Icon data={view_list} />
								</Button>
								<Button onClick={() => setIssuesView('table')}>
									<Icon data={view_column} />
								</Button>
								<Button onClick={() => setIssuesView('diagram')}>
									<NetworkIcon />
								</Button>
							</Button.Toggle>
						)}
					</div>
					<Outlet />
				</div>
			</div>
		</IssuesContext.Provider>
	);
};

const defaultIssues: Record<string, Issue[]> = {
	Decision: [
		{
			type: 'Decision',
			name: 'Decision 1',
			id: crypto.randomUUID(),
			description: '',
			position: {
				x: Math.random() * 1000,
				y: Math.random() * 1000,
			},
		},
		{
			type: 'Decision',
			name: 'Decision 2',
			id: crypto.randomUUID(),
			description: '',
			position: {
				x: Math.random() * 1000,
				y: Math.random() * 1000,
			},
		},
		{
			type: 'Decision',
			name: 'asdqwdq ',
			id: crypto.randomUUID(),
			description: '',
			position: {
				x: Math.random() * 1000,
				y: Math.random() * 1000,
			},
		},
		{
			type: 'Decision',
			name: '2424rfevwef',
			id: crypto.randomUUID(),
			description: '',
			position: {
				x: Math.random() * 1000,
				y: Math.random() * 1000,
			},
		},
		{
			type: 'Decision',
			name: 'Decision 2',
			id: crypto.randomUUID(),
			description: '',
			position: {
				x: Math.random() * 1000,
				y: Math.random() * 1000,
			},
		},
	],
	Uncertainty: [
		{
			type: 'Uncertainty',
			name: 'Uncertainties 3',
			id: crypto.randomUUID(),
			description: '',
			position: {
				x: Math.random() * 1000,
				y: Math.random() * 1000,
			},
		},
		{
			type: 'Uncertainty',
			name: 'wefv42fvwef',
			id: crypto.randomUUID(),
			description: '',
			position: {
				x: Math.random() * 1000,
				y: Math.random() * 1000,
			},
		},
		{
			type: 'uncertainty',
			name: 'bgern535b35gb',
			id: crypto.randomUUID(),
			description: '',
			position: {
				x: Math.random() * 1000,
				y: Math.random() * 1000,
			},
		},
	],
	Value: [
		{
			type: 'Value',
			name: 'Uncertainties 4',
			id: crypto.randomUUID(),
			description: '',
			position: {
				x: Math.random() * 1000,
				y: Math.random() * 1000,
			},
		},
		{
			type: 'Value',
			name: 'k768j567hgv5v3gr',
			id: crypto.randomUUID(),
			description: '',
			position: {
				x: Math.random() * 1000,
				y: Math.random() * 1000,
			},
		},
		{
			type: 'Value',
			name: 'e5t35bt3tb5',
			id: crypto.randomUUID(),
			description: '',
			position: {
				x: Math.random() * 1000,
				y: Math.random() * 1000,
			},
		},
	],
	Fact: [
		{
			type: 'Fact',
			name: 'hrt h4tb4hbh4t',
			id: crypto.randomUUID(),
			description: '',
			position: {
				x: Math.random() * 1000,
				y: Math.random() * 1000,
			},
		},
	],
	Unassigned: [],
};
