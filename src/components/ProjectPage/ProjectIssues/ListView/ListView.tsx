import { Checkbox, EdsProvider, Table } from '@equinor/eds-core-react';
import { useSelectedProjectIssues } from '../../../../hooks/useSelectedProjectIssues';
import { IssueRow } from './IssueRow';

export const ListView = () => {
	const issues = useSelectedProjectIssues();
	const hasIssues = issues.length > 0;

	return (
		<div
			className='bg-background-default shadow-tile flex w-full flex-col
        	items-start gap-4 rounded-sm p-4'
		>
			<div className='grid w-full items-center text-start'>
				<div className='flex gap-2'>
					<h2 className='text-2xl font-semibold'>Issues</h2>
					<span className='bg-background-light flex w-8 items-center justify-center rounded-full'>
						{issues.length}
					</span>
				</div>
				<p className='text-text-tertiary'>
					Manage the issues that need to be made in this project
				</p>
			</div>
			{hasIssues && (
				<EdsProvider density='comfortable'>
					<div className='outline-background-medium w-full overflow-auto rounded-sm outline-1'>
						<Table className='w-full'>
							<Table.Head>
								<Table.Row>
									<Table.Cell className='w-21 pl-1!'>
										<Checkbox />
									</Table.Cell>
									<Table.Cell className='min-w-48'>Name</Table.Cell>
									<Table.Cell className='w-[1350px]'>Description</Table.Cell>
									<Table.Cell className='w-24'>Outcomes/Options</Table.Cell>
									<Table.Cell className='w-30'>Issue Type</Table.Cell>
									<Table.Cell className='w-12'>Boundary</Table.Cell>
									<Table.Cell className='w-34 whitespace-nowrap'>
										Date Added
									</Table.Cell>
								</Table.Row>
							</Table.Head>
							<Table.Body>
								{issues.map(issue => (
									<IssueRow key={issue.id} issue={issue} />
								))}
							</Table.Body>
						</Table>
					</div>
				</EdsProvider>
			)}
		</div>
	);
};
