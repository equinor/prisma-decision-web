import {
	Dialog,
	Typography,
	Button,
	Autocomplete,
	Label,
	CircularProgress,
} from '@equinor/eds-core-react';
import styled from 'styled-components';
import { useGetUsers } from '../../hooks/api/useGetUsers';
import { roleTypes, User } from '../../validators';
import { useProjectRoleAssignmentForm } from '../../hooks/useProjectRoleAssignmentForm';
import { ErrorMessage } from '@hookform/error-message';
import { FormErrorMessage } from '../common/FormErrorMessage';
import { Controller } from 'react-hook-form';

const Wrapper = styled.div`
	display: flex;
	gap: 8px;
`;

type ProjectAssignmentDialogProps = {
	isProjectAssignmentDialogOpen: boolean;
	selectedProjectId: string;
	selectedProjectName: string;
	onClose: (value: React.SetStateAction<boolean>) => void;
};

export const ProjectAssignmentDialog = ({
	isProjectAssignmentDialogOpen,
	selectedProjectId,
	selectedProjectName,
	onClose,
}: ProjectAssignmentDialogProps) => {
	const { users, isLoading: isLoadingUsers } = useGetUsers();
	const usersNameList = users.map((user: User) => user.name);

	const handleClose = () => {
		onClose(false);
	};
	const {
		handleSubmit,
		isPending,
		setValue,
		control,
		data,
		formState: { errors },
	} = useProjectRoleAssignmentForm();
	setValue('project_id', selectedProjectId);

	return (
		<Dialog
			open={isProjectAssignmentDialogOpen}
			className='fixed top-1/2 left-1/2 min-w-2xl -translate-x-1/2 -translate-y-1/2 transform'
		>
			<Dialog.Header>
				<Dialog.Title>Role Assignment in {selectedProjectName}</Dialog.Title>
			</Dialog.Header>
			<Dialog.CustomContent>
				{' '}
				<form onSubmit={handleSubmit}>
					<div className='flex flex-col gap-6'>
						<div>
							<Label className='m-12' label='Project Name' />
							<Controller
								name='project_id'
								control={control}
								render={({ field }) => (
									<Typography className='mr-2' {...field}>
										{selectedProjectName}
									</Typography>
								)}
							/>
						</div>
						<Controller
							name='user_ids'
							control={control}
							rules={{ required: 'Please select at least one user.' }}
							render={({ field: { value, onChange } }) => (
								<>
									<Autocomplete
										style={{ width: '50%' }}
										options={usersNameList}
										label='Assign Users'
										loading={isLoadingUsers}
										multiple
										placeholder={
											value.length > 0
												? `${value.length}/ ${usersNameList.length} selected`
												: 'Search for users'
										}
										onOptionsChange={({ selectedItems }) => {
											if (selectedItems !== undefined) {
												const filteredItems = selectedItems.filter(
													(item): item is string =>
														typeof item === 'string',
												);
												// Map selected user names to their corresponding user IDs
												const selectedUserIds = users
													.filter((user: User) =>
														filteredItems.includes(user.name),
													)
													.map((user: User) => user.id);
												onChange(selectedUserIds);
											} else {
												onChange([]);
											}
										}}
										selectedOptions={
											value
												? users
														.filter((user: User) =>
															value.includes(user.id),
														)
														.map((user: User) => user.name)
												: []
										}
									/>

									{value && value.length === 0 ? (
										<ErrorMessage
											as={FormErrorMessage}
											name='user_ids'
											errors={errors}
										/>
									) : null}
								</>
							)}
						/>
						<Controller
							name='role'
							control={control}
							render={({ field: { value, onChange } }) => (
								<>
									<Autocomplete
										style={{ width: '50%' }}
										options={roleTypes}
										label='Assign Role'
										placeholder={'Search for roles'}
										onOptionsChange={({ selectedItems }) => {
											if (selectedItems !== undefined) {
												onChange(selectedItems[0]);
											} else {
												onChange('');
											}
										}}
										selectedOptions={value ? [value] : []}
									/>
									{value.length === 0 && (
										<ErrorMessage
											as={FormErrorMessage}
											name='role'
											errors={errors}
										/>
									)}
								</>
							)}
						/>
						<div className='flex flex-col gap-2'>
							{isPending ? (
								<p>Role assignment in progress...</p>
							) : data ? (
								<p>Role assignment successful.</p>
							) : (
								<p>Role assignment failed. Please try again.</p>
							)}
						</div>
						<Dialog.Actions>
							<Wrapper>
								<Button
									className='col-span-1 md:col-span-2 md:-col-end-1 md:w-max md:place-self-end'
									type='submit'
								>
									{isPending ? <CircularProgress size={24} /> : 'Save'}
								</Button>
								<Button variant='ghost' onClick={handleClose}>
									Cancel
								</Button>
							</Wrapper>
						</Dialog.Actions>
					</div>
				</form>
			</Dialog.CustomContent>
		</Dialog>
	);
};
