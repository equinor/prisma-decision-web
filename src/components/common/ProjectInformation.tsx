import {
	Autocomplete,
	Button,
	CircularProgress,
	DatePicker,
	Icon,
	Table,
	TextField,
	Typography,
} from '@equinor/eds-core-react';
import { add } from '@equinor/eds-icons';
import { ErrorMessage } from '@hookform/error-message';
import { useState } from 'react';
import { useController } from 'react-hook-form';
import { useGetUsers } from '../../hooks/api/useGetUsers';
import { useProjectForm } from '../../hooks/useProjectForm';
import { ProjectRole, RoleType, roleTypes, User } from '../../validators';
import { FormErrorMessage } from './FormErrorMessage';

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
	const [selectedUsers, setSelectedUser] = useState<User[]>([]);
	const [selectedRole, setSelectedRole] = useState<RoleType>();
	const {
		field: { value: usersValue, onChange: setUser },
	} = useController({
		name: 'users',
		control: control,
	});

	const handleDeleteUser = (user: ProjectRole) => {
		setUser(usersValue.filter(u => u.user_id !== user.user_id));
	};
	const handleRoleCreate = () => {
		if (selectedRole && selectedUsers.length > 0) {
			const userWithRole: ProjectRole[] = selectedUsers.map(user => {
				return {
					id: crypto.randomUUID(),
					project_id: getValues('id'),
					role: selectedRole,
					...user,
				};
			});
			const mergeUser = [...usersValue, ...userWithRole].reduce((acc, user) => {
				if (acc.find(u => u.user_id === user.user_id)) return acc;
				acc.push(user);
				return acc;
			}, [] as ProjectRole[]);
			setUser(mergeUser);
			setSelectedUser([]);
			setSelectedRole(undefined);
		}
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
			</div>
			<div className='grid w-full gap-4 md:grid-cols-[1fr_1fr_auto]'>
				<Autocomplete
					itemToKey={user => user?.user_id}
					options={users.filter(
						user => !usersValue.some(u => u.user_id === user.user_id),
					)}
					optionLabel={user => user.user_name}
					label='Assign Users'
					loading={isLoadingUsers}
					multiple={true}
					placeholder={'Search for users'}
					onOptionsChange={({ selectedItems }) => {
						setSelectedUser(selectedItems);
					}}
					selectedOptions={selectedUsers}
				/>
				<Autocomplete
					options={roleTypes}
					label='Assign Role'
					placeholder={'Search for roles'}
					onOptionsChange={({ selectedItems }) => {
						setSelectedRole(selectedItems[0]);
					}}
					selectedOptions={selectedRole ? [selectedRole] : []}
				/>
				<Button className='mt-4!' onClick={handleRoleCreate}>
					<Icon data={add} />
					Add
				</Button>
			</div>
			<Table>
				<Table.Caption>
					<Typography variant='h4'>Project Roles</Typography>
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
						<Table.Row key={user.user_id + user.role}>
							<Table.Cell>{user.user_name}</Table.Cell>
							<Table.Cell>{user.role}</Table.Cell>
							<Table.Cell>
								<Button onClick={() => handleDeleteUser(user)}>Delete</Button>
							</Table.Cell>
						</Table.Row>
					))}
				</Table.Body>
			</Table>

			<Button
				className='col-span-1 md:col-span-2 md:-col-end-1 md:w-max md:place-self-end'
				type='submit'
			>
				{isPending ? <CircularProgress size={24} /> : 'Save'}
			</Button>
		</form>
	);
};
