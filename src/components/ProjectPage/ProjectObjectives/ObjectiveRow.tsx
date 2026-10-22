import { Button, Icon, Table } from '@equinor/eds-core-react';
import { arrow_down, arrow_up } from '@equinor/eds-icons';
import { format } from 'date-fns';
import { useUpdateObjectives } from '../../../hooks/api/useUpdateObjective';
import { useObjectiveForm } from '../../../hooks/useObjectiveForm';
import { useSelectedProjectObjectives } from '../../../hooks/useSelectedProjectObjectives';
import { Objective, objectiveTypes } from '../../../validators';
import { InlineTextField } from '../../common/InlineTextField';
import { showSuccessToast } from '../../ShowToast';
import { DeleteObjectiveDialog } from './DeleteObjectiveDialog';
import { CardLabelMenu } from '../../common/Cards/CardLabelMenu';

export const ObjectiveRow = ({ objective }: { objective: Objective }) => {
	const { selectedObjectives } = useSelectedProjectObjectives();
	const { mutate: updateObjectives } = useUpdateObjectives();
	const {
		register,
		handleSubmit,
		reset,
		getValues,
		getFieldState,
		setValue,
		formState: { errors },
	} = useObjectiveForm({
		objective,
		onSuccess: () => showSuccessToast('Objective updated'),
	});
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

	const saveText = async (field: 'name' | 'description') => {
		if (getValues(field) !== objective[field]) await handleSubmit();
		return !getFieldState(field).invalid;
	};

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
			<Table.Cell className='p-0!'>
				<InlineTextField
					value={objective.name}
					label='Objective name'
					inputProps={register('name')}
					error={errors.name?.message}
					onEdit={() => reset(objective)}
					onSave={() => saveText('name')}
				/>
			</Table.Cell>
			<Table.Cell className='max-w-xl p-0!'>
				<InlineTextField
					value={objective.description}
					label='Objective description'
					inputProps={register('description')}
					error={errors.description?.message}
					multiline
					className='truncate'
					onEdit={() => reset(objective)}
					onSave={() => saveText('description')}
				/>
			</Table.Cell>
			<Table.Cell>
				<CardLabelMenu
					title='OBJECTIVE TYPE'
					label={`Objective type: ${objective.type}`}
					value={objective.type}
					options={objectiveTypes}
					onChange={type => {
						reset(objective);
						setValue('type', type);
						void handleSubmit();
					}}
				>
					{objective.type}
				</CardLabelMenu>
			</Table.Cell>
			<Table.Cell className='whitespace-nowrap'>
				{objective.created_at ? format(objective.created_at, 'yyyy-MM-dd') : '-'}
			</Table.Cell>
			<Table.Cell className='whitespace-nowrap'>
				{objective.updated_at ? format(objective.updated_at, 'yyyy-MM-dd') : '-'}
			</Table.Cell>
		</Table.Row>
	);
};
