import { Autocomplete, Button, Icon, Table } from '@equinor/eds-core-react';
import { add, delete_to_trash } from '@equinor/eds-icons';
import { useState } from 'react';
import { useController, useWatch } from 'react-hook-form';
import { useGetUsers } from '../../../hooks/api/useGetUsers';
import { useProjectFormContext } from '../../../hooks/useProjectForm';
import { ProjectRole, RoleType, roleTypes, User } from '../../../validators';

export const UserSection = () => {
	const { control, getValues } = useProjectFormContext();
	const [selectedUsers, setSelectedUser] = useState<User[]>([]);
	const [selectedRole, setSelectedRole] = useState<RoleType>();
	const { users, isLoading: isLoadingUsers } = useGetUsers();
	const {
		field: { value: usersValue, onChange: setUser },
	} = useController({
		name: 'users',
		control: control,
	});

	const currentUsers = useWatch({
		control,
		name: 'users',
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
		<div className='flex flex-col gap-4'>
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
			{currentUsers.length > 0 && (
				<div className='outline-background-medium w-full rounded-sm outline-1'>
					<Table className='w-full table-fixed'>
						<Table.Head>
							<Table.Row>
								<Table.Cell className='w-12'></Table.Cell>
								<Table.Cell className='w-1/2'>User Name</Table.Cell>
								<Table.Cell className='w-1/2'>Role</Table.Cell>
							</Table.Row>
						</Table.Head>
						<Table.Body>
							{usersValue.map(user => (
								<Table.Row key={user.user_id + (user.role ?? 'NoRole')}>
									<Table.Cell className='px-0! pl-1!'>
										<div className='flex justify-center'>
											<Button
												variant='ghost_icon'
												onClick={() => handleDeleteUser(user)}
											>
												<Icon data={delete_to_trash} />
											</Button>
										</div>
									</Table.Cell>
									<Table.Cell>{user.user_name}</Table.Cell>
									<Table.Cell>{user.role}</Table.Cell>
								</Table.Row>
							))}
						</Table.Body>
					</Table>
				</div>
			)}
		</div>
	);
};
