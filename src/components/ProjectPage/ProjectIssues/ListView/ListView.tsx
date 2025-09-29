import { Checkbox, EdsProvider, Table } from '@equinor/eds-core-react';
import { useSelectedProjectIssues } from '../../../../hooks/useSelectedProjectIssues';
import { getIssueColumnColor } from '../../../../utils/getIssueColumnColor';
import { DeleteIssueDialog } from '../DeleteIssueDialog';
import { EditIssueModal } from '../EditIssueModal';

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
									<Table.Cell>Name</Table.Cell>
									<Table.Cell className='w-[1350px]'>Description</Table.Cell>
									<Table.Cell className='w-24'>Alternatives/Options</Table.Cell>
									<Table.Cell className='w-30'>Issue Type</Table.Cell>
									<Table.Cell className='w-12'>Boundary</Table.Cell>
									<Table.Cell className='w-34 whitespace-nowrap'>
										Date Added
									</Table.Cell>
								</Table.Row>
							</Table.Head>
							<Table.Body>
								{issues.map(issue => (
									<Table.Row key={issue.id}>
										<Table.Cell className='px-0! pl-1!'>
											<div className='flex items-center'>
												<Checkbox />
												<EditIssueModal issue={issue} />
												<DeleteIssueDialog issue={issue} />
											</div>
										</Table.Cell>
										<Table.Cell>{issue.name}</Table.Cell>
										<Table.Cell className='max-w-xl truncate'>
											{issue.description}
										</Table.Cell>
										<Table.Cell>
											{issue.type === 'Decision'
												? issue.decision.options.length
												: issue.type === 'Uncertainty'
													? issue.uncertainty.outcomes.length
													: null}
										</Table.Cell>
										<Table.Cell className={getIssueColumnColor(issue.type)}>
											{issue.type}
										</Table.Cell>
										<Table.Cell className='capitalize'>
											{issue.boundary}
										</Table.Cell>
										<Table.Cell className='whitespace-nowrap'>
											2023-05-01
										</Table.Cell>
									</Table.Row>
								))}
							</Table.Body>
						</Table>
					</div>
				</EdsProvider>
			)}
		</div>
	);
};
