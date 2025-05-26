import { Autocomplete, Button, TextField } from '@equinor/eds-core-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { useLocalStorage } from '@uidotdev/usehooks';
import { ChangeEvent, useState } from 'react';
import { Issue } from './ProjectPage';

const categoryOptions = [
	{ label: 'Decision', value: 'decision' },
	{ label: 'Uncertainty', value: 'uncertainty' },
	{ label: 'Fact', value: 'fact' },
	{ label: 'Value', value: 'value' },
	{ label: 'Unassigned', value: 'unassigned' },
];

export const CreateProjectIssues = () => {
	const [issue, setIssue] = useState<Issue>({
		type: 'decision',
		name: '',
		id: crypto.randomUUID(),
		description: '',
	});
	const [isOpen, setIsOpen] = useLocalStorage('createIssueOpen', true);
	const selectedCategory = categoryOptions.find(option => option.value === issue?.type);
	return (
		<Collapsible open={isOpen} onOpenChange={setIsOpen}>
			<div
				className='bg-background-default shadow-tile flex w-[456px]
                	flex-col items-start gap-6 rounded-sm p-6 xl:w-[936px] 2xl:w-[1416px]'
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
					<div className='grid w-full grid-cols-2 gap-4'>
						<TextField
							placeholder='Enter issue name...'
							label='Issue Name'
							onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
								setIssue(prev => ({ ...prev, name: e.target.value }))
							}
							value={issue.name}
						/>
						<TextField placeholder='Enter label...' label='Label' />
						<Autocomplete
							label='Category'
							optionLabel={option => option.label}
							options={categoryOptions}
							selectedOptions={selectedCategory ? [selectedCategory] : []}
							onOptionsChange={({ selectedItems }) => {
								if (selectedItems.length === 0) return;
								setIssue(prev => ({ ...prev, type: selectedItems[0].value }));
							}}
						/>
						<Autocomplete
							label='Boundry'
							options={['In', 'On', 'Out']}
							initialSelectedOptions={['In']}
						/>
						<TextField
							label='Description'
							placeholder='Enter description...'
							className='col-span-2'
							multiline
							rows={4}
						/>
					</div>
					<Button className='self-end'>Add Issue</Button>
				</CollapsibleContent>
			</div>
		</Collapsible>
	);
};
