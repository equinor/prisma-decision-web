import { ReactNode } from 'react';
import { ParentTypeIndicator } from '../../../common/ParentTypeIndicator';
import { getParentLabel, ParentDescriptor, ParentStateValue } from '../ProbabilityTable/utils';
import { ParentStateLookups } from './getDiscreteValueRows';

export const DiscreteValueTable = <T extends ParentStateValue>({
	parents,
	parentRowSpans,
	rows,
	lookups,
	valueColumns,
	renderValueCells,
}: DiscreteValueTableProps<T>) => (
	<div className='grid grid-cols-[auto_1fr] gap-2'>
		{parents.length > 0 && (
			<table className='bg-background-light border-separate border-spacing-2 rounded-sm'>
				<thead>
					<tr className='text-left text-[0.7rem]'>
						{parents.map(parent => (
							<th
								key={parent.issueId}
								className='bg-background-default rounded-sm px-2 py-1 font-normal whitespace-nowrap'
							>
								<div className='flex items-center gap-1.5'>
									<ParentTypeIndicator kind={parent.kind} />
									<div>
										<span className='text-text-tertiary text-[10px]'>
											{parent.kind === 'decision'
												? 'Decision'
												: 'Uncertainty'}
										</span>
										<div className='text-sm font-bold'>{parent.issueName}</div>
									</div>
								</div>
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map(({ rowKey, values }, rowIndex) => (
						<tr key={rowKey}>
							{parents.map((parent, parentIndex) => {
								const rowSpan = parentRowSpans[parentIndex];
								if (rowIndex % rowSpan !== 0) return null;

								return (
									<td
										key={`${rowKey}-${parent.issueId}`}
										rowSpan={rowSpan}
										className='bg-background-default rounded-sm px-2 py-1 text-sm whitespace-nowrap'
									>
										{getParentLabel(values[0], parent, lookups)}
									</td>
								);
							})}
						</tr>
					))}
				</tbody>
			</table>
		)}

		<table className='bg-background-light border-separate border-spacing-2 rounded-sm'>
			<thead>
				<tr className='text-left text-[0.7rem]'>
					{valueColumns.map(column => (
						<th
							key={column.id}
							className='bg-background-default h-11.25 rounded-sm px-2 py-1 font-normal '
						>
							{column.eyebrow && (
								<div className='text-text-tertiary text-[10px]'>
									{column.eyebrow}
								</div>
							)}
							<div className='flex items-center truncate text-sm font-bold'>
								{column.label}
							</div>
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{rows.map(row => (
					<tr key={row.rowKey}>{renderValueCells(row.values)}</tr>
				))}
			</tbody>
		</table>
	</div>
);

export type DiscreteValueRow<T> = {
	rowKey: string;
	values: T[];
};

type DiscreteValueTableProps<T extends ParentStateValue> = {
	parents: ParentDescriptor[];
	parentRowSpans: number[];
	rows: DiscreteValueRow<T>[];
	lookups: ParentStateLookups;
	valueColumns: { id: string; label: string; eyebrow?: string }[];
	renderValueCells: (values: T[]) => ReactNode;
};
