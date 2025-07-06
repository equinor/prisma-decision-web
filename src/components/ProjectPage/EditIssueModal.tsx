import { Button, CircularProgress, Dialog, DialogContent, Icon } from '@equinor/eds-core-react';
import { edit } from '@equinor/eds-icons';
import { useState } from 'react';
import { FormProvider, useWatch } from 'react-hook-form';
import { useIssueForm } from '../../hooks/useIssueForm';
import { Issue } from '../../validators';
import { DecisionFormSection } from '../common/DecisionFormSection';
import { IssueFormSection } from '../common/IssueFormSection';
import { UncertaintyFormSection } from '../common/UncertaintyFormSection';
import { ValueFormSection } from '../common/ValueFormSection';

interface EditIssueModalProps {
	issue: Issue;
}

export const EditIssueModal = ({ issue }: EditIssueModalProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const formMethods = useIssueForm(issue);
	const { control, onSubmit, isPending } = formMethods;
	const selectedType = useWatch({
		control,
		name: 'type',
	});

	const handleClose = () => {
		setIsOpen(false);
	};
	return (
		<>
			<Button variant='ghost_icon' onClick={() => setIsOpen(true)}>
				<Icon data={edit} />
			</Button>
			{isOpen && (
				<Dialog
					open
					className='fixed top-1/2 left-1/2 max-h-[90vh] w-[min(700px,_90vw)]! -translate-x-1/2 -translate-y-1/2 transform overflow-auto'
				>
					<DialogContent>
						<FormProvider {...formMethods}>
							<form onSubmit={onSubmit} className='flex flex-col gap-6'>
								<div className='flex items-center justify-between'>
									<h2 className='text-2xl font-semibold'>Edit Issue</h2>
									<Button variant='ghost_icon' onClick={handleClose}>
										×
									</Button>
								</div>

								<IssueFormSection />
								{selectedType === 'Decision' && <DecisionFormSection />}
								{selectedType === 'Uncertainty' && <UncertaintyFormSection />}
								{selectedType === 'Value' && <ValueFormSection />}
								<div className='flex justify-end gap-2'>
									<Button variant='outlined' onClick={handleClose}>
										Cancel
									</Button>
									<Button type='submit'>
										{isPending ? (
											<CircularProgress size={16} />
										) : (
											'Update Issue'
										)}
									</Button>
								</div>
							</form>
						</FormProvider>
					</DialogContent>
				</Dialog>
			)}
		</>
	);
};
