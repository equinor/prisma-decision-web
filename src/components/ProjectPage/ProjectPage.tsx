import { Button, Icon } from '@equinor/eds-core-react';
import { view_column, view_list } from '@equinor/eds-icons';
import { useLocalStorage } from '@uidotdev/usehooks';
import { Link, Outlet, useLocation } from 'react-router';
import { NetworkIcon } from '../common/NetworkIcon';

export type Issue = {
	name: string;
	description: string;
	id: string;
	type: string;
	position?: { x: number; y: number };
};

export const ProjectPage = () => {
	const location = useLocation();
	const [issueView, setIssuesView] = useLocalStorage('issuesView', 'list');
	const showIssuesView = location.pathname.includes('issues');
	let activeView = 0;
	if (issueView === 'table') activeView = 1;
	if (issueView === 'diagram') activeView = 2;

	return (
		<div className='mx-auto w-[min(1600px,_90%)]'>
			<div className='flex flex-col gap-6'>
				<div className='max-w-[1000px]'>
					<h1 className='text-3xl font-bold'>The Used Car Buyer Problem</h1>
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
	);
};
