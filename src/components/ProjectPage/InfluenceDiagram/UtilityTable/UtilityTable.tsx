import { Button, Icon } from '@equinor/eds-core-react';
import { close } from '@equinor/eds-icons';
import { getDiagramIssueBorderColor } from '../../../../utils/getDiagramIssueBorderColor';
import { Issue } from '../../../../validators';
import { CardContainer } from '../../../common/Cards/CardContainer';
import { DiscreteValueTable } from '../DiscreteValueTable/DiscreteValueTable';
import { DiscreteUtilityCell } from './DiscreteUtilityCell';
import { useUtilityTable } from './useUtilityTable';
import { useBulkUpdateDiscreteUtilities } from '../../../../hooks/api/useUpdateDiscreteUtilities';

export const UtilityTable = ({ issue, selected, onClose }: UtilityTableProps) => {
	const { parents, parentRowSpans, rows, lookups } = useUtilityTable(issue);
	const { mutate: updateUtilities, isPending } = useBulkUpdateDiscreteUtilities();
	const utilities = rows.flatMap(row => row.values);
	const hasNonZeroValue = utilities.some(utility => utility.utility_value !== 0);
	return (
		<CardContainer
			issueType={issue.type}
			selected={selected}
			className={`w-auto rounded-sm border-2 px-2 pt-1 pb-2 ${getDiagramIssueBorderColor(issue.type, !!selected)}`}
		>
			<div className='flex flex-col'>
				<div className='flex items-center justify-between pt-1 pb-2 pl-2'>
					<h6 className='leading-6 font-medium'>{`${issue.name} Utility Table`}</h6>
					<div className='flex items-center gap-1'>
						<Button
							variant='outlined'
							disabled={!hasNonZeroValue || isPending}
							onClick={() =>
								updateUtilities(
									utilities.map(utility => ({ ...utility, utility_value: 0 })),
								)
							}
						>
							Reset all
						</Button>
						<Button variant='ghost_icon' onClick={() => onClose?.(false)}>
							<Icon data={close} />
						</Button>
					</div>
				</div>
				<DiscreteValueTable
					parents={parents}
					parentRowSpans={parentRowSpans}
					rows={rows}
					lookups={lookups}
					valueColumns={[{ id: 'default-metric', label: 'Default metric' }]}
					renderValueCells={utilities =>
						utilities.map(utility => (
							<DiscreteUtilityCell
								key={utility.id}
								utilityId={utility.utility_id}
								discreteUtilities={utilities}
							/>
						))
					}
				/>
			</div>
		</CardContainer>
	);
};

type UtilityTableProps = {
	issue: Issue;
	selected: boolean | undefined;
	onClose: (value: boolean) => void;
};
