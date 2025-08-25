import {
	Autocomplete,
	Button,
	CircularProgress,
	DatePicker,
	Table,
	TextField,
	Typography,
} from '@equinor/eds-core-react';
import { ErrorMessage } from '@hookform/error-message';
import { useProjectForm } from '../../hooks/useProjectForm';
import { FormErrorMessage } from './FormErrorMessage';
import { useSelectedProject } from '../../hooks/useSelectedProject';
import { useGetUsers } from '../../hooks/api/useGetUsers';
import { useState } from 'react';
import { useController } from 'react-hook-form';
import { ProjectRole, roleTypes } from '../../validators';

export const ProjectInformation = () => {
	const {
		handleSubmit,
		register,
		isPending,
		control,
		getValues,
		formState: { errors },
	} = useProjectForm();
	const { users, isLoading: isLoadingUsers } = useGetUsers();
	const [selectedUsers, setSelectedUser] = useState<ProjectRole[]>();
	const [isOptionChanged, setIsOptionChanged] = useState<boolean>(false);
	const selectedProject = useSelectedProject();

	const {
		field: { value: usersValue, onChange: setUser },
	} = useController({
		name: 'users',
		control: control,
	});

	const handleDeleteUser = (user: ProjectRole) => {
		setUser(usersValue.filter(u => u.user_id !== user.user_id));
	};

	return (
		<form
			onSubmit={handleSubmit}
			className='bg-background-default shadow-tile flex w-full flex-col
            items-start gap-4 rounded-sm p-4'
		>
			<div>
				<h2 className='text-2xl font-semibold'>Project Information</h2>
				<p className='text-text-tertiary'>
					Enter the basic information about your decision optimization project
				</p>
			</div>
			<div className='grid w-full grid-cols-1 gap-4 md:grid-cols-2'>
				<div className='col-span-1 md:col-span-2'>
					<TextField
						label='Project Name'
						placeholder='Enter project name...'
						{...register('name')}
					/>
					<ErrorMessage as={FormErrorMessage} name='name' errors={errors} />
				</div>
				<TextField label='Decision Maker' placeholder='Enter decision maker name...' />
				<DatePicker label='Select End Date' />
				<div className='col-span-1 md:col-span-2'>
					<TextField
						multiline
						rows={5}
						label='Description'
						placeholder='Enter description...'
						{...register('description')}
					/>
					<ErrorMessage as={FormErrorMessage} name='description' errors={errors} />
				</div>
				<Autocomplete
					itemToKey={user => user?.id}
					options={users}
					optionLabel={user => user.name}
					label='Assign Users'
					loading={isLoadingUsers}
					multiple
					placeholder={'Search for users'}
					onOptionsChange={({ selectedItems }) => {
						const userWithRole: ProjectRole[] = selectedItems.map(user => ({
							user_name: user.name,
							user_id: user.id,
							project_id: getValues('id'),
							role: null,
						}));
						if (isOptionChanged) {
							setSelectedUser((prev: ProjectRole[] | undefined) => [
								...(prev || []),
								...userWithRole,
							]);
						} else {
							setSelectedUser(userWithRole);
						}
						setIsOptionChanged(true);
					}}
				/>
				<Autocomplete
					options={roleTypes}
					label='Assign Role'
					placeholder={'Search for roles'}
					onOptionsChange={({ selectedItems }) => {
						if (selectedItems !== undefined && selectedUsers) {
							if (selectedUsers && selectedUsers.length > 0) {
								const userWithRole: ProjectRole[] = selectedUsers.map(
									selectedUser => ({
										...selectedUser,
										role: selectedItems[0],
									}),
								);
								// // Remove duplicates by user_id and role
								// const uniqueUserWithRole = userWithRole.filter(
								// 	(user, index, self) =>
								// 		self.findIndex(
								// 			u => u.user_id === user.user_id && u.role === user.role,
								// 		) === index,
								// );
								// console.log(uniqueUserWithRole);

								if (selectedProject) {
									const mergeUser = [...selectedProject.users, ...userWithRole];
									setUser(mergeUser);
								} else {
									setUser(userWithRole);
								}
							}
						}
					}}
				/>
				{selectedProject && (
					<Table>
						<Table.Caption>
							<Typography variant='h2'>Project Roles</Typography>
						</Table.Caption>
						<Table.Head>
							<Table.Row>
								<Table.Cell>User Name</Table.Cell>
								<Table.Cell>Role</Table.Cell>
								<Table.Cell>Action</Table.Cell>
							</Table.Row>
						</Table.Head>
						<Table.Body>
							{usersValue.map(user => (
								<Table.Row key={user.user_id + (user.role ?? 'NoRole')}>
									<Table.Cell>{user.user_name}</Table.Cell>
									<Table.Cell>{user.role}</Table.Cell>
									<Table.Cell>
										<Button onClick={() => handleDeleteUser(user)}>
											Delete
										</Button>
									</Table.Cell>
								</Table.Row>
							))}
						</Table.Body>
					</Table>
				)}
				<ErrorMessage as={FormErrorMessage} name='users.0.role' errors={errors} />

				<Button
					className='col-span-1 md:col-span-2 md:-col-end-1 md:w-max md:place-self-end'
					type='submit'
				>
					{isPending ? <CircularProgress size={24} /> : 'Save'}
				</Button>
			</div>
		</form>
	);
};
