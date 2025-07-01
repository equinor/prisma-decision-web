import { Autocomplete, Button, TextField } from '@equinor/eds-core-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useController, useForm } from 'react-hook-form';
import { useCreateIssue } from '../../hooks/api/useCreateIssue';
import { useSelectedProject } from '../../hooks/useSelectedProject';
import { Issue, issueSchema, issueTypes } from '../../validators';
import { useMemo } from 'react';

const getDefaultValues = (scenarioId: string): Issue => {
	return {
		boundry: 'in',
		name: '',
		description: '',
		type: 'Unassigned',
		id: crypto.randomUUID(),
		order: 0,
		scenario_id: scenarioId,
		decision: {
			id: crypto.randomUUID(),
			issue_id: crypto.randomUUID(),
			alternatives: [],
		},
		uncertainty: {
			id: crypto.randomUUID(),
			issue_id: crypto.randomUUID(),
			probabilities: [],
		},
		utility: {
			id: crypto.randomUUID(),
			issue_id: crypto.randomUUID(),
			values: [],
		},
		value_metric: {
			id: crypto.randomUUID(),
			issue_id: crypto.randomUUID(),
			name: '',
		},
		node: {
			id: crypto.randomUUID(),
			issue_id: crypto.randomUUID(),
			name: 'default',
			scenario_id: scenarioId,
			node_style: {
				id: crypto.randomUUID(),
				node_id: crypto.randomUUID(),
				x_position: 0,
				y_position: 0,
			},
		},
	};
};

export const CreateIssues = () => {
	const selectedProject = useSelectedProject();
	const scenario = selectedProject?.scenarios[0];
	const { mutate: createIssue } = useCreateIssue();
	const defaultValues = useMemo(() => getDefaultValues(scenario?.id || crypto.randomUUID()), []);
	const { register, control, handleSubmit } = useForm({
		values: defaultValues,
		resolver: zodResolver(issueSchema),
	});

	const {
		field: { onChange: onChangeType, ref: typeRef, value: selectedType },
	} = useController({
		control,
		name: 'type',
	});

	const {
		field: { onChange: onBoundryType, ref: boundryRef, value: selectedBoundry },
	} = useController({
		control,
		name: 'boundry',
	});

	const onSubmit = handleSubmit(
		async data => {
			await createIssue(data);
			// Reset form values after submission
		},
		errors => {
			// eslint-disable-next-line no-console
			console.error('Form errors:', errors);
		},
	);
	const [isOpen, setIsOpen] = useLocalStorage('createIssueOpen', true);
	return (
		<Collapsible open={isOpen} onOpenChange={setIsOpen}>
			<form
				onSubmit={onSubmit}
				className='bg-background-default shadow-tile flex flex-col items-start gap-6 rounded-sm p-6'
			>
				<CollapsibleTrigger asChild>
					<div className='w-full cursor-pointer'>
						<h2 className='text-2xl font-semibold'>Create Issue</h2>
						<p className='text-text-tertiary'>
							Add issues related to decisions, uncertainties, and value drivers
						</p>
					</div>
				</CollapsibleTrigger>
				<CollapsibleContent className='flex w-full flex-col gap-6'>
					<div className='grid w-full grid-cols-1 gap-4 md:grid-cols-2'>
						<TextField
							placeholder='Enter issue name...'
							label='Issue Name'
							{...register('name')}
						/>
						<TextField placeholder='Enter label...' label='Label' />
						<Autocomplete
							label='Category'
							options={issueTypes}
							hideClearButton
							selectedOptions={[selectedType]}
							ref={typeRef}
							onOptionsChange={({ selectedItems }) => {
								if (selectedItems.length === 0) return;
								onChangeType(selectedItems[0]);
							}}
						/>
						<Autocomplete
							label='Boundry'
							hideClearButton
							options={['In', 'On', 'Out']}
							selectedOptions={[selectedBoundry]}
							ref={boundryRef}
							onOptionsChange={({ selectedItems }) => {
								if (selectedItems.length === 0) return;
								onBoundryType(selectedItems[0]);
							}}
						/>
						<TextField
							label='Description'
							placeholder='Enter description...'
							className='md:col-span-2'
							{...register('description')}
							multiline
							rows={4}
						/>
					</div>
					<Button className='md:self-end' type='submit'>
						Add Issue
					</Button>
				</CollapsibleContent>
			</form>
		</Collapsible>
	);
};
