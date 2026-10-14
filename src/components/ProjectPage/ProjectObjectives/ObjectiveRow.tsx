import { Button, Icon, Table } from '@equinor/eds-core-react';
import { arrow_down, arrow_up } from '@equinor/eds-icons';
import { format } from 'date-fns';
import { useController } from 'react-hook-form';
import { useUpdateObjectives } from '../../../hooks/api/useUpdateObjective';
import { useObjectiveForm } from '../../../hooks/useObjectiveForm';
import { useSelectedProjectObjectives } from '../../../hooks/useSelectedProjectObjectives';
import { Objective, objectiveTypes } from '../../../validators';
import { DropdownTableCell } from '../../common/DropdownTableCell';
import { EditableTableCell } from '../../common/EditableTableCell';
import { DeleteObjectiveDialog } from './DeleteObjectiveDialog';

export const ObjectiveRow = ({ objective }: { objective: Objective }) => {
	const { selectedObjectives } = useSelectedProjectObjectives();
	const { mutate: updateObjectives } = useUpdateObjectives();
	const { control, handleSubmit } = useObjectiveForm({ objective });
	const objectiveIndex = selectedObjectives.findIndex(item => item.id === objective.id);

	const handleMoveObjective = (direction: 'up' | 'down') => {
		const adjacentIndex = objectiveIndex + (direction === 'up' ? -1 : 1);

		if (objectiveIndex === -1 || !selectedObjectives[adjacentIndex]) return;

		const reorderedObjectives = [...selectedObjectives];
		[reorderedObjectives[objectiveIndex], reorderedObjectives[adjacentIndex]] = [
			reorderedObjectives[adjacentIndex],
			reorderedObjectives[objectiveIndex],
		];

		updateObjectives(reorderedObjectives.map((item, index) => ({ ...item, ordering: index })));
	};

	const {
		field: { onChange },
	} = useController({
		control,
		name: 'description',
	});

	const {
		field: { onChange: onChangeTitle },
	} = useController({
		control,
		name: 'name',
	});

	const {
		field: { onChange: onChangeType },
	} = useController({
		control,
		name: 'type',
	});

	return (
		<Table.Row>
			<Table.Cell className='px-0! pl-1!'>
				<div className='flex items-center'>
					<DeleteObjectiveDialog objective={objective} />
					<Button
						variant='ghost_icon'
						aria-label={`Move ${objective.name} up`}
						disabled={objectiveIndex <= 0}
						onClick={() => handleMoveObjective('up')}
					>
						<Icon data={arrow_up} />
					</Button>
					<Button
						variant='ghost_icon'
						aria-label={`Move ${objective.name} down`}
						disabled={objectiveIndex === selectedObjectives.length - 1}
						onClick={() => handleMoveObjective('down')}
					>
						<Icon data={arrow_down} />
					</Button>
				</div>
			</Table.Cell>
			<EditableTableCell
				onBlur={() => handleSubmit()}
				onChange={onChangeTitle}
				className='max-w-xl truncate'
				value={objective.name}
			/>
			<EditableTableCell
				onBlur={() => handleSubmit()}
				onChange={onChange}
				className='max-w-xl truncate'
				value={objective.description}
			/>
			<DropdownTableCell
				className='w-30'
				value={objective.type}
				options={objectiveTypes}
				onChange={onChangeType}
				onBlur={() => handleSubmit()}
			/>
			<Table.Cell className='whitespace-nowrap'>
				{objective.created_at ? format(objective.created_at, 'yyyy-MM-dd') : '-'}
			</Table.Cell>
			<Table.Cell className='whitespace-nowrap'>
				{objective.updated_at ? format(objective.updated_at, 'yyyy-MM-dd') : '-'}
			</Table.Cell>
		</Table.Row>
	);
};
