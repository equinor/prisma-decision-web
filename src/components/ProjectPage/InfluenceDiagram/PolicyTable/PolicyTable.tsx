import { Button, Icon } from '@equinor/eds-core-react';
import { close } from '@equinor/eds-icons';
import { sortByCreatedAt } from '../../../../utils/sortByCreatedAt';
import { Issue } from '../../../../validators';
import { CardContainer } from '../../../common/Cards/CardContainer';
import { ConditionalTable } from '../ConditionalTable/ConditionalTable';
import { usePolicyTable } from './usePolicyTable';

export const PolicyTable = ({ issue, selected, onClose }: PolicyTableProps) => (
	<CardContainer
		issueType={issue.type}
		selected={selected}
		className='w-auto rounded-sm border-2 px-2 pt-1 pb-2'
	>
		<div className='flex flex-col'>
			<div className='flex items-center gap-1 pt-1 pb-2 pl-2'>
				<h6 className='mr-auto pr-2 leading-6 font-medium'>{`${issue.name} Policy Table`}</h6>
				<Button variant='ghost_icon' onClick={() => onClose(false)}>
					<Icon data={close} />
				</Button>
			</div>
			<PolicyConditionalTable issue={issue} />
		</div>
	</CardContainer>
);

export const PolicyConditionalTable = ({ issue }: { issue: Issue }) => {
	const { parents, rows, lookups } = usePolicyTable(issue);
	const options = sortByCreatedAt(issue.decision.options);
	if (!rows.length) {
		return (
			<p className='text-text-tertiary px-2 py-1 text-xs'>
				No policy rows available for this decision.
			</p>
		);
	}
	return (
		<ConditionalTable parents={parents} rows={rows} lookups={lookups}>
			<ConditionalTable.Head>
				{options.map(option => (
					<ConditionalTable.Column key={option.id} eyebrow={issue.name}>
						{option.name}
					</ConditionalTable.Column>
				))}
			</ConditionalTable.Head>
			<ConditionalTable.Body>
				{rows.map(row => (
					<ConditionalTable.Row key={row.rowKey}>
						{options.map(option => (
							<ConditionalTable.ValueCell key={option.id}>
								{row.values.find(policy => policy.option_id === option.id)
									?.value === 1
									? '1'
									: '0'}
							</ConditionalTable.ValueCell>
						))}
					</ConditionalTable.Row>
				))}
			</ConditionalTable.Body>
		</ConditionalTable>
	);
};

type PolicyTableProps = {
	issue: Issue;
	selected: boolean | undefined;
	onClose: (value: boolean) => void;
};
