import { Button, Icon } from '@equinor/eds-core-react';
import { close, delete_to_trash } from '@equinor/eds-icons';
import { Issue, RestrictionTable as RestrictionTableType } from '../../../../validators';
import { CardContainer } from '../../../common/Cards/CardContainer';
import { ConditionalTable } from '../ConditionalTable/ConditionalTable';
import { RestrictionToggleCell } from './RestrictionToggleCell';
import { useRestrictionTable } from './useRestrictionTable';
import { useRestrictionToggle } from './useRestrictionToggle';

export const RestrictionTable = ({
	restrictionTable,
	sourceIssue,
	targetIssue,
	onClose,
	onDeleteEdge,
}: RestrictionTableProps) => {
	const { parents, rows, lookups, sourceStates, targetStates } = useRestrictionTable(
		restrictionTable,
		sourceIssue,
		targetIssue,
	);
	const { toggleEntry, getViolationForEntry } = useRestrictionToggle(
		restrictionTable,
		sourceIssue,
		targetIssue,
	);

	return (
		<CardContainer
			issueType={targetIssue.type}
			className='border-background-medium! w-auto rounded-sm border-2 px-2 pt-1 pb-2'
		>
			<div className='flex flex-col'>
				<div className='flex items-center gap-1 pt-1 pb-2 pl-2'>
					<h6 className='mr-auto pr-2 leading-6 font-medium'>{`${sourceIssue.name} to ${targetIssue.name} Restriction Table`}</h6>
					<Button
						variant='ghost_icon'
						color='danger'
						aria-label='Delete edge'
						onClick={onDeleteEdge}
					>
						<Icon data={delete_to_trash} />
					</Button>
					<Button variant='ghost_icon' onClick={() => onClose(false)}>
						<Icon data={close} />
					</Button>
				</div>
				{!targetStates.length ? (
					<p className='text-text-tertiary px-2 py-1 text-xs'>
						Target issue &quot;{targetIssue.name}&quot; has no states defined. Please
						define states for the target issue to view the restriction table.
					</p>
				) : !sourceStates.length ? (
					<p className='text-text-tertiary px-2 py-1 text-xs'>
						Source issue &quot;{sourceIssue.name}&quot; has no states defined. Please
						define states for the source issue to view the restriction table.
					</p>
				) : !rows.length ? (
					<p className='text-text-tertiary px-2 py-1 text-xs'>
						No restriction rows available for this edge.
					</p>
				) : (
					<ConditionalTable parents={parents} rows={rows} lookups={lookups}>
						<ConditionalTable.Head>
							{targetStates.map(state => (
								<ConditionalTable.Column key={state.id} eyebrow={targetIssue.name}>
									{state.name}
								</ConditionalTable.Column>
							))}
						</ConditionalTable.Head>
						<ConditionalTable.Body>
							{rows.map(row => {
								const parentState = sourceStates.find(
									state => state.id === row.values[0].parent_state_id,
								);
								return (
									<ConditionalTable.Row key={row.rowKey}>
										{parentState &&
											targetStates.map(childState => {
												const entry = row.values.find(
													entry => entry.child_state_id === childState.id,
												);
												return (
													<RestrictionToggleCell
														key={childState.id}
														entry={entry}
														parentState={parentState}
														childState={childState}
														onToggle={toggleEntry}
														violation={
															entry && getViolationForEntry(entry.id)
														}
													/>
												);
											})}
									</ConditionalTable.Row>
								);
							})}
						</ConditionalTable.Body>
					</ConditionalTable>
				)}
			</div>
		</CardContainer>
	);
};

type RestrictionTableProps = {
	restrictionTable: RestrictionTableType;
	sourceIssue: Issue;
	targetIssue: Issue;
	onClose: (value: boolean) => void;
	onDeleteEdge: () => void;
};
