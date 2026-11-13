import { Button, Icon } from '@equinor/eds-core-react';
import { close } from '@equinor/eds-icons';
import { useUpdateDiscreteUtilities } from '../../../../hooks/api/useUpdateDiscreteUtilities';
import { Issue } from '../../../../validators';
import { CardContainer } from '../../../common/Cards/CardContainer';
import { ConditionalTable } from '../ConditionalTable/ConditionalTable';
import { ResetUtilitiesButton } from './ResetUtilitiesButton';
import { useUtilityTable } from './useUtilityTable';

export const UtilityTable = ({ issue, selected, onClose }: UtilityTableProps) => (
	<CardContainer
		issueType={issue.type}
		selected={selected}
		className='w-auto rounded-sm border-2 px-2 pt-1 pb-2'
	>
		<div className='flex flex-col'>
			<div className='flex items-center gap-1 pt-1 pb-2 pl-2'>
				<h6 className='mr-auto pr-2 leading-6 font-medium'>{`${issue.name} Utility Table`}</h6>
				<ResetUtilitiesButton issue={issue} />
				<Button variant='ghost_icon' onClick={() => onClose(false)}>
					<Icon data={close} />
				</Button>
			</div>
			<UtilityConditionalTable issue={issue} />
		</div>
	</CardContainer>
);

export const UtilityConditionalTable = ({ issue }: { issue: Issue }) => {
	const { parents, rows, lookups } = useUtilityTable(issue);
	const { mutate: updateUtility } = useUpdateDiscreteUtilities();
	return (
		<ConditionalTable parents={parents} rows={rows} lookups={lookups}>
			<ConditionalTable.Head>
				<ConditionalTable.Column>Default metric</ConditionalTable.Column>
			</ConditionalTable.Head>
			<ConditionalTable.Body>
				{rows.map(row => (
					<ConditionalTable.Row key={row.rowKey}>
						{row.values.map(utility => (
							<ConditionalTable.NumberCell
								key={utility.id + utility.utility_value}
								id={utility.id}
								value={utility.utility_value}
								onCommit={utility_value =>
									updateUtility({ ...utility, utility_value })
								}
							/>
						))}
					</ConditionalTable.Row>
				))}
			</ConditionalTable.Body>
		</ConditionalTable>
	);
};

type UtilityTableProps = {
	issue: Issue;
	selected: boolean | undefined;
	onClose: (value: boolean) => void;
};
