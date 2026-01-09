import { useSelectedProjectIssues } from '../../../../hooks/useSelectedProjectIssues';
import { IssuesInDiagramTable } from './IssuesInDiagramTable';
import { IssuesNotInDiagramTable } from './IssuesNotInDiagramTable';

export const ListView = () => {
	const issues = useSelectedProjectIssues();

	return (
		<div
			className='bg-background-default shadow-tile flex w-full flex-col
        	items-start rounded-sm p-4'
		>
			<div className='grid w-full items-center text-start'>
				<div className='flex gap-2'>
					<h2 className='text-2xl font-semibold'>Issues</h2>
					<span className='bg-background-light flex w-8 items-center justify-center rounded-full'>
						{issues.length}
					</span>
				</div>
			</div>
			<div className='flex w-full flex-col gap-4'>
				<IssuesInDiagramTable />
				<IssuesNotInDiagramTable />
			</div>
		</div>
	);
};
