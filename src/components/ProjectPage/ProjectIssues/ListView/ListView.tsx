import { useSelectedProjectIssues } from '../../../../hooks/useSelectedProjectIssues';
import { useCreatedIssueHighlight } from '../useCreatedIssueHighlight';
import { useSelectedProject } from '../../ProjectContext';
import { IssuesInDiagramTable } from './IssuesInDiagramTable';
import { IssuesNotInDiagramTable } from './IssuesNotInDiagramTable';
import { QuickCreateIssue } from './QuickCreateIssue';

export const ListView = () => {
	const issues = useSelectedProjectIssues();
	const project = useSelectedProject();
	const { highlightedIssueIds, highlightCreatedIssue } = useCreatedIssueHighlight();

	return (
		<div
			className='bg-background-default shadow-tile flex w-full flex-col
        	items-start rounded-sm p-4'
		>
			<div className='grid w-full items-center gap-4 pb-4 text-start xl:grid-cols-[auto_1fr]'>
				<div className='flex gap-2'>
					<h2 className='text-2xl font-bold'>Issues</h2>
					<span className='bg-background-light flex w-8 items-center justify-center rounded-full'>
						{issues.length}
					</span>
				</div>
				<QuickCreateIssue key={project.id} onCreated={highlightCreatedIssue} />
			</div>
			<div className='flex w-full flex-col gap-4'>
				<IssuesInDiagramTable issues={issues} highlightedIssueIds={highlightedIssueIds} />
				<IssuesNotInDiagramTable
					issues={issues}
					highlightedIssueIds={highlightedIssueIds}
				/>
			</div>
		</div>
	);
};
