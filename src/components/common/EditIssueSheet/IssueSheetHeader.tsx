import { DialogHeading } from '@ariakit/react';
import { useWatch } from 'react-hook-form';
import { useIssueFormContext } from '../../../hooks/useIssueForm';
import { Issue } from '../../../validators';
import { BoundaryLabel } from '../Cards/BoundaryLabel';
import { IssueTypeLabel } from '../Cards/IssueTypeLabel';
import { IssueForm } from '../IssueForm/IssueForm';

export const IssueSheetHeader = ({ issue, disabled }: { issue: Issue; disabled: boolean }) => {
	const { control, setValue } = useIssueFormContext();
	const [name, type, boundary] = useWatch({ control, name: ['name', 'type', 'boundary'] });
	return (
		<>
			<header className='flex min-w-0 items-start justify-between gap-4'>
				<DialogHeading className='min-w-0 flex-1 text-xl leading-8 font-normal wrap-break-word'>
					{name}
				</DialogHeading>
				<div className='flex shrink-0 items-center gap-2'>
					<IssueTypeLabel
						type={type}
						onChange={
							disabled
								? undefined
								: value => setValue('type', value, { shouldDirty: true })
						}
					/>
					<BoundaryLabel
						boundary={boundary}
						onChange={
							disabled
								? undefined
								: value => setValue('boundary', value, { shouldDirty: true })
						}
					/>
				</div>
			</header>
			<IssueForm.BoundaryWarning issue={issue} />
		</>
	);
};
