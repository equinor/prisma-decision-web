import { Tooltip } from '@equinor/eds-core-react';
import { TextField } from '@equinor/eds-core-react/next';
import { ComponentProps, createContext, ReactNode, use, useState } from 'react';
import { cn } from '../../../../utils/cn';
import { ParentTypeIndicator } from '../../../common/ParentTypeIndicator';
import {
	getParentLabel,
	getParentRowSpans,
	ParentDescriptor,
	ParentStateValue,
} from '../ProbabilityTable/utils';
import { ParentStateLookups } from './getDiscreteValueRows';

const unrestricted: string[] = [];
const RestrictedCellsContext = createContext(unrestricted);

export const ConditionalTable = ({
	parents,
	lookups,
	rows,
	restrictedCells = unrestricted,
	children,
}: ConditionalTableProps) => {
	const parentRowSpans = getParentRowSpans(parents);
	return (
		<div
			className={cn('grid grid-cols-[auto_1fr] gap-2', parents.length === 0 && 'grid-cols-1')}
		>
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
											<div className='text-sm font-bold'>
												{parent.issueName}
											</div>
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
				<RestrictedCellsContext value={restrictedCells}>{children}</RestrictedCellsContext>
			</table>
		</div>
	);
};

const Head = ({ children }: { children: ReactNode }) => (
	<thead>
		<tr className='text-left text-[0.7rem]'>{children}</tr>
	</thead>
);

const Column = ({ eyebrow, children }: { eyebrow?: string; children: ReactNode }) => (
	<th className='bg-background-default h-11.25 rounded-sm px-2 py-1 font-normal '>
		{eyebrow && <div className='text-text-tertiary text-[10px]'>{eyebrow}</div>}
		<div className='flex items-center truncate text-sm font-bold'>{children}</div>
	</th>
);

const Body = ({ children }: { children: ReactNode }) => <tbody>{children}</tbody>;

const Row = ({ children }: { children: ReactNode }) => <tr>{children}</tr>;

const NumberCell = ({ id, value, onCommit, ...props }: NumberCellProps) => {
	const [text, setText] = useState(String(Math.round(value * 100) / 100));
	const restricted = use(RestrictedCellsContext).includes(id);
	return (
		<td className='text-right'>
			<Tooltip
				title='Disabled by a restriction on a parent edge.'
				placement='top'
				disabled={!restricted}
			>
				<div>
					<TextField
						{...props}
						type='number'
						step={0.01}
						inputMode='decimal'
						className='nopan nodrag w-full'
						disabled={restricted}
						value={text}
						onChange={event => setText(event.target.value)}
						onBlur={() => {
							const parsedValue = Number.parseFloat(text) || 0;
							setText(String(parsedValue));
							if (parsedValue !== value) onCommit(parsedValue);
						}}
					/>
				</div>
			</Tooltip>
		</td>
	);
};

const ValueCell = ({ className, ...props }: ComponentProps<'td'>) => (
	<td
		className={cn('bg-background-default rounded-sm px-2 py-1 text-center text-sm', className)}
		{...props}
	/>
);

ConditionalTable.Head = Head;
ConditionalTable.Column = Column;
ConditionalTable.Body = Body;
ConditionalTable.Row = Row;
ConditionalTable.NumberCell = NumberCell;
ConditionalTable.ValueCell = ValueCell;

type ConditionalTableProps = {
	parents: ParentDescriptor[];
	lookups: ParentStateLookups;
	rows: { rowKey: string; values: ParentStateValue[] }[];
	restrictedCells?: string[];
	children: ReactNode;
};

type NumberCellProps = {
	id: string;
	value: number;
	onCommit: (value: number) => void;
	min?: number;
	max?: number;
};
