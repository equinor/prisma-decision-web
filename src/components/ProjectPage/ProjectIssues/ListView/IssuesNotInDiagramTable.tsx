import { Button, EdsProvider, Icon, Popover, Table } from '@equinor/eds-core-react';
import { info_circle } from '@equinor/eds-icons';
import { useState } from 'react';
import { useSelectedProjectIssues } from '../../../../hooks/useSelectedProjectIssues';
import { BoundaryLabel } from '../../../common/Cards/BoundaryLabel';
import { FactLabel, UnassignedLabel } from '../../../common/Cards/IssueLabel';
import { IssueRow } from './IssueRow';

export const IssuesNotInDiagramTable = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

	const issues = useSelectedProjectIssues().filter(issue => {
		const inOrOnBoundary = issue.boundary === 'out';
		if (issue.type === 'Decision') {
			return inOrOnBoundary || issue.decision.type !== 'Focus';
		}
		if (issue.type === 'Uncertainty') {
			return inOrOnBoundary || !issue.uncertainty.is_key;
		}
		return inOrOnBoundary;
	});

	const hasIssues = issues.length > 0;
	if (!hasIssues) return;
	return (
		<div className='flex flex-col gap-2'>
			<EdsProvider density='comfortable'>
				<div className='flex items-center gap-2'>
					<p>Issues filtered out</p>
					<Button variant='ghost_icon' ref={setAnchorEl} onClick={() => setIsOpen(true)}>
						<Icon data={info_circle} />
					</Button>
					<Popover open={isOpen} anchorEl={anchorEl} onClose={() => setIsOpen(false)}>
						<Popover.Content className='flex flex-col gap-2'>
							<h5 className='text-text-secondary text-[10px] font-medium tracking-[1.1px]'>
								ISSUES FILTERED OUT
							</h5>
							<div className='flex items-center gap-2'>
								<p className='text-sm font-medium'>Type:</p>
								<UnassignedLabel />
								<p className='text-sm font-medium'>and</p>
								<FactLabel />
							</div>
							<div className='flex items-center gap-2'>
								<p className='text-sm font-medium'>Boundary:</p>
								<BoundaryLabel boundary='out' />
							</div>
						</Popover.Content>
					</Popover>
				</div>
				<div className='outline-background-medium w-full overflow-auto rounded-sm outline-1'>
					<Table className='w-full'>
						<Table.Head>
							<Table.Row>
								<Table.Cell className='w-21 pl-1!'></Table.Cell>
								<Table.Cell className='min-w-48'>Name</Table.Cell>
								<Table.Cell className='w-337.5'>Description</Table.Cell>
								<Table.Cell className='w-24'>Outcomes/&#10;&#13;Options</Table.Cell>
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
		</div>
	);
};
