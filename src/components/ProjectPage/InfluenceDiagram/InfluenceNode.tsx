import { Table } from '@equinor/eds-core-react';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Handle, NodeProps, NodeResizeControl, Position } from '@xyflow/react';
import { useMemo } from 'react';
import { useExpandCard } from '../../../hooks/useExpandCard';
import { useSelectedProjectEdges } from '../../../hooks/useSelectedProjectEdges';
import { useSelectedProjectIssues } from '../../../hooks/useSelectedProjectIssues';
import { buildInfluenceTable } from '../../../utils/buildInfluenceRowItems';
import { getDiagramIssueBorderColor } from '../../../utils/getDiagramIssueBorderColor';
import { getIssueCardType } from '../../../utils/getIssueCardType';
import { Issue } from '../../../validators';
import { CardContainer } from '../../common/Cards/CardContainer';
import { InfluenceParentNode } from './types';

export const InfluenceNode = ({ id, data, selected }: NodeProps<InfluenceParentNode>) => {
	const { expanded } = useExpandCard(data.issue.id);
	const IssueCard = getIssueCardType(data.issue.type);
	return (
		<>
			<Handle
				type='source'
				position={Position.Top}
				id='top'
				className='bg-primary-resting! z-1 h-3! w-3!'
			/>
			<Handle
				type='source'
				position={Position.Bottom}
				id='bottom'
				className='bg-primary-resting! z-1 h-3! w-3!'
			/>
			<Handle
				type='source'
				position={Position.Left}
				id='left'
				className='bg-primary-resting! z-1 h-3! w-3!'
			/>
			<Handle
				type='source'
				position={Position.Right}
				id='right'
				className='bg-primary-resting! z-1 h-3! w-3!'
			/>

			<IssueCard
				issue={data.issue}
				className={`h-full w-full overflow-hidden rounded-sm outline-2 ${getDiagramIssueBorderColor(data.issue.type, selected)}`}
			/>
			{expanded && (
				<CardContainer
					className={`mt-2 h-auto w-full overflow-hidden rounded-sm outline-2 ${getDiagramIssueBorderColor(data.issue.type, selected)}`}
				>
					<div className='mb-2 flex flex-col'>
						<ul className='flex flex-col gap-2 text-sm'>
							{data.issue.decision.options.map(option => (
								<li
									key={option.id}
									className='bg-background-light flex justify-between rounded-sm px-2 py-1'
								>
									<p>{option.name}</p>
									<p>{option.utility}</p>
								</li>
							))}
						</ul>
					</div>
				</CardContainer>
			)}
			{data.issue.type === 'Uncertainty' && (
				<ProbabilityTable id={id} issue={data.issue} selected={selected} />
			)}
			<NodeResizeControl
				position='top-right'
				minWidth={241}
				minHeight={130}
				className='size-4! border-0! bg-transparent!'
			/>
			<NodeResizeControl
				position='top-left'
				minWidth={241}
				minHeight={130}
				className='size-4! border-0! bg-transparent!'
			/>
			<NodeResizeControl
				position='bottom-left'
				minWidth={241}
				minHeight={130}
				className='size-4! border-0! bg-transparent!'
			/>
			<NodeResizeControl
				position='bottom-right'
				minWidth={241}
				minHeight={130}
				className='size-4! border-0! bg-transparent!'
			/>
		</>
	);
};

const ProbabilityTable = ({
	id,
	issue,
	selected,
}: {
	id: string;
	issue: Issue;
	selected: boolean;
}) => {
	const issues = useSelectedProjectIssues();
	const edges = useSelectedProjectEdges();

	// Find parent nodes (incoming edges -> sources are parents)
	const parentNodes = useMemo(() => {
		const incoming = edges.filter(e => e.head_id === id);
		const parentIds = new Set(incoming.map(e => e.tail_id));
		return issues.filter(n => parentIds.has(n.node.id));
	}, [edges, issues, id]);

	// Build lightweight rows/columns, then convert to TanStack Table columns
	const { columns, rows } = useMemo(() => {
		return buildInfluenceTable(parentNodes, issue);
	}, [parentNodes, id, issue, issues]);

	const table = useReactTable({
		data: rows,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});
	if (table.getRowModel().rows.length === 0) return null;
	return (
		<CardContainer
			className={`absolute top-0 left-[calc(100%+0.5rem)] h-auto w-auto overflow-hidden 
			p-0 outline-2 ${getDiagramIssueBorderColor(issue.type, selected)}`}
		>
			<Table className='w-full text-left text-xs'>
				<Table.Head>
					{table.getHeaderGroups().map(headerGroup => (
						<Table.Row key={headerGroup.id}>
							{headerGroup.headers.map(header => (
								<Table.Cell
									key={header.id}
									className='min-w-25 px-2 py-1 whitespace-nowrap'
								>
									{header.isPlaceholder
										? null
										: flexRender(
												header.column.columnDef.header,
												header.getContext(),
											)}
								</Table.Cell>
							))}
						</Table.Row>
					))}
				</Table.Head>
				<Table.Body>
					{table.getRowModel().rows.map(row => (
						<Table.Row key={row.id} className='odd:bg-background-light'>
							{row.getVisibleCells().map(cell => {
								return (
									<Table.Cell
										key={cell.id}
										className='px-2 py-1 whitespace-nowrap'
									>
										{flexRender(
											cell.column.columnDef.cell,
											cell.getContext(),
										) ?? String(cell.getValue() ?? '')}
									</Table.Cell>
								);
							})}
						</Table.Row>
					))}
				</Table.Body>
			</Table>
		</CardContainer>
	);
};
