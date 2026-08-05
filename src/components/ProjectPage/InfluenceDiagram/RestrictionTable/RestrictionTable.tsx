import { Button, Icon } from '@equinor/eds-core-react';
import { close, delete_to_trash } from '@equinor/eds-icons';
import { Issue, RestrictionTable as RestrictionTableType } from '../../../../validators';
import { CardContainer } from '../../../common/Cards/CardContainer';
import { DiscreteValueTable } from '../DiscreteValueTable/DiscreteValueTable';
import { RestrictionToggleCell } from './RestrictionToggleCell';
import { useRestrictionTable } from './useRestrictionTable';

export const RestrictionTable = ({
	restrictionTable,
	sourceIssue,
	targetIssue,
	onClose,
	onDeleteEdge,
}: RestrictionTableProps) => {
	const { parents, parentRowSpans, rows, lookups, sourceStates, targetStates } =
		useRestrictionTable(restrictionTable, sourceIssue, targetIssue);

	if (!rows.length || !targetStates.length) {
		return (
			<div className='border-background-light bg-background-default text-text-tertiary w-87.5 rounded-sm border border-dashed px-3 py-2 text-xs'>
				Restriction tables are available for edges between decisions and uncertainties.
			</div>
		);
	}

	return (
		<CardContainer
			issueType={targetIssue.type}
			className={'border-background-medium! w-auto rounded-sm border-2 px-2 pt-1 pb-2!'}
		>
			<div className='flex flex-col'>
				<div className='flex items-center justify-between gap-3 pt-1 pb-2 pl-2'>
					<h6 className='leading-6 font-medium'>{`${sourceIssue.name} to ${targetIssue.name} Restriction Table`}</h6>
					<div className='flex items-center gap-1'>
						<Button variant='ghost_icon' color='danger' onClick={onDeleteEdge}>
							<Icon data={delete_to_trash} />
						</Button>
						<Button variant='ghost_icon' onClick={() => onClose(false)}>
							<Icon data={close} />
						</Button>
					</div>
				</div>
				<DiscreteValueTable
					parents={parents}
					parentRowSpans={parentRowSpans}
					rows={rows}
					lookups={lookups}
					valueColumns={targetStates.map(state => ({
						id: state.id,
						label: state.name,
						eyebrow: targetIssue.name,
					}))}
					renderValueCells={entries => {
						const parentState = sourceStates.find(
							state => state.id === entries[0].parent_state_id,
						);
						if (!parentState) return null;

						return targetStates.map(childState => (
							<RestrictionToggleCell
								key={childState.id}
								entry={entries.find(
									entry => entry.child_state_id === childState.id,
								)}
								parentState={parentState}
								childState={childState}
							/>
						));
					}}
				/>
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
