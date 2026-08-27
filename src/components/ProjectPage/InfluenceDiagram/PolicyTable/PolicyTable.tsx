import { Button, Icon } from '@equinor/eds-core-react';
import { close } from '@equinor/eds-icons';
import { Issue } from '../../../../validators';
import { CardContainer } from '../../../common/Cards/CardContainer';
import { DiscreteValueTable } from '../DiscreteValueTable/DiscreteValueTable';
import { usePolicyTable } from './usePolicyTable';

export const PolicyTable = ({ issue, selected, onClose, ref }: PolicyTableProps) => {
	const { parents, parentRowSpans, rows, lookups } = usePolicyTable(issue);
	if (!rows.length) {
		return (
			<div
				ref={ref}
				className='border-background-medium bg-background-default text-text-tertiary w-87.5 rounded-sm border border-dashed px-3 py-2 text-xs'
			>
				No policy rows available for this decision.
			</div>
		);
	}

	return (
		<CardContainer
			ref={ref}
			issueType={issue.type}
			selected={selected}
			includeBorder
			className='w-auto rounded-sm px-2 pt-1 pb-2'
		>
			<div className='flex flex-col'>
				<div className='flex items-center justify-between pt-1 pb-2 pl-2'>
					<h6 className='leading-6 font-medium'>{`${issue.name} Policy Table`}</h6>
					<Button variant='ghost_icon' onClick={() => onClose?.(false)}>
						<Icon data={close} />
					</Button>
				</div>
				<DiscreteValueTable
					parents={parents}
					parentRowSpans={parentRowSpans}
					rows={rows}
					lookups={lookups}
					valueColumns={issue.decision.options.map(option => ({
						id: option.id,
						label: option.name,
						eyebrow: issue.name,
					}))}
					renderValueCells={values =>
						issue.decision.options.map(option => {
							const value =
								values.find(row => row.option_id === option.id)?.value ?? 0;
							return (
								<td
									key={option.id}
									className='bg-background-default rounded-sm px-2 py-1 text-center text-sm'
								>
									{value === 1 ? '1' : '0'}
								</td>
							);
						})
					}
				/>
			</div>
		</CardContainer>
	);
};

type PolicyTableProps = {
	ref?: React.Ref<HTMLDivElement>;
	issue: Issue;
	selected: boolean | undefined;
	onClose: (value: boolean) => void;
};
