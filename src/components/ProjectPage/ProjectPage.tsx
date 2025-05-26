import { Button, Icon } from '@equinor/eds-core-react';
import { share, view_column, view_list } from '@equinor/eds-icons';
import { useState } from 'react';
import { OpportunityStatments } from '../CreateProjectPage/OpportunityStatments';
import { ProjectInformation } from '../CreateProjectPage/ProjectInformation';
import { ProjectObjectives } from '../CreateProjectPage/ProjectObjectives';
import { Decisions } from './ListView/Decisions';
import { ProjectIssues } from './ProjectIssues';
import { TableView } from './TableView/TableView';
import { Uncertainties } from './ListView/Uncertainties';
import { Values } from './ListView/Values';

export type Issue = {
	name: string;
	id: string;
	type: string;
};

const defaultIssues: Record<string, Issue[]> = {
	decision: [
		{ type: 'decision', name: 'Decision 1', id: crypto.randomUUID() },
		{ type: 'decision', name: 'Decision 2', id: crypto.randomUUID() },
		{ type: 'decision', name: 'asdqwdq ', id: crypto.randomUUID() },
		{ type: 'decision', name: '2424rfevwef', id: crypto.randomUUID() },
		{ type: 'decision', name: 'Decision 2', id: crypto.randomUUID() },
	],
	uncertainty: [
		{ type: 'uncertainty', name: 'Uncertainties 3', id: crypto.randomUUID() },
		{ type: 'uncertainty', name: 'wefv42fvwef', id: crypto.randomUUID() },
		{ type: 'uncertainty', name: 'bgern535b35gb', id: crypto.randomUUID() },
	],
	value: [
		{ type: 'value', name: 'Uncertainties 4', id: crypto.randomUUID() },
		{ type: 'value', name: 'k768j567hgv5v3gr', id: crypto.randomUUID() },
		{ type: 'value', name: 'e5t35bt3tb5', id: crypto.randomUUID() },
	],
	fact: [{ type: 'fact', name: 'hrt h4tb4hbh4t', id: crypto.randomUUID() }],
	unassigned: [],
};

export const ProjectPage = () => {
	const [selectedProjectView, setSelectedProjectView] = useState<'project' | 'issues'>('project');
	const [issuesView, setIssuesView] = useState<'list' | 'table'>('list');
	const [issues, setIssues] = useState(defaultIssues);

	const selectedIndexes = selectedProjectView === 'project' ? [0] : [1];
	const showProjectView = selectedProjectView === 'project';
	const showIssuesView = selectedProjectView === 'issues';
	const showIssuesList = issuesView === 'list';
	const showIssuesColumn = issuesView === 'table';
	const selectedView = showIssuesList ? 0 : 1;
	return (
		<div className='mx-auto w-[456px] xl:w-[936px] 2xl:w-[1416px]'>
			<div className='flex flex-col gap-6'>
				<div className='max-w-[1000px]'>
					<h1 className='text-3xl font-bold'>The Used Car Buyer Problem</h1>
				</div>
				<div className='flex justify-between'>
					<Button.Toggle selectedIndexes={selectedIndexes}>
						<Button onClick={() => setSelectedProjectView('project')}>
							Project Details
						</Button>
						<Button onClick={() => setSelectedProjectView('issues')}>Issues</Button>
					</Button.Toggle>
					{showIssuesView && (
						<Button.Toggle selectedIndexes={[selectedView]}>
							<Button onClick={() => setIssuesView('list')}>
								<Icon data={view_list} />
							</Button>
							<Button onClick={() => setIssuesView('table')}>
								<Icon data={view_column} />
							</Button>
							<Button>
								<Icon data={share} />
							</Button>
						</Button.Toggle>
					)}
				</div>
				{showProjectView && (
					<>
						<ProjectInformation />
						<OpportunityStatments />
						<ProjectObjectives />
					</>
				)}
				{showIssuesView && showIssuesList && (
					<>
						<ProjectIssues
							onAddIssue={issue =>
								setIssues(prev => {
									const issues = prev[issue.type];
									return {
										...prev,
										[issue.type]: [...issues, issue],
									};
								})
							}
						/>
						<Decisions />
						<Uncertainties />
						<Values />
					</>
				)}
				{showIssuesView && showIssuesColumn && (
					<>
						<ProjectIssues
							onAddIssue={issue =>
								setIssues(prev => {
									const issues = prev[issue.type];
									return {
										...prev,
										[issue.type]: [...issues, issue],
									};
								})
							}
						/>
						<TableView issues={issues} setIssues={setIssues} />
					</>
				)}
			</div>
		</div>
	);
};
