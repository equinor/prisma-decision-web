import { Autocomplete, Button, Icon, Search, Table } from '@equinor/eds-core-react';
import { check_circle_outlined, delete_to_trash, lock } from '@equinor/eds-icons';
import { useState } from 'react';
import { useController } from 'react-hook-form';
import { useSearchUsers } from '../../../hooks/api/useSearchUsers';
import { useProjectFormContext } from '../../../hooks/useProjectForm';
import { RoleType, roleTypes, User } from '../../../validators';
import { ErrorMessage } from '@hookform/error-message';
import { FormErrorMessage } from '../FormErrorMessage';
import { useSelectedProject } from '../../../hooks/useSelectedProject';
import { useDebounce } from '@uidotdev/usehooks';

type UserSectionProps = {
	handleSubmit: () => void;
};
const LimitUserDisplay = 100; // Limit the number of users displayed to prevent performance issues

type UserWithRole = User & { id: string; role?: RoleType };

// All Users Table Component
const AllUsersTable = ({
	availableUsers,
	selectedUsers,
	handleAddUser,
}: {
	availableUsers: (User & { hasAccess: boolean })[];
	selectedUsers: UserWithRole[];
	handleAddUser: (user: UserWithRole) => void;
}) => (
	<Table className='w-full table-fixed'>
		<Table.Head className='bg-background-default sticky top-0 z-10'>
			<Table.Row>
				<Table.Cell>User Name</Table.Cell>
				<Table.Cell className='w-19'>Action</Table.Cell>
			</Table.Row>
		</Table.Head>
		<Table.Body>
			{availableUsers.map((user, index) => (
				<Table.Row
					key={`${user.azure_id}-${index}`}
					className={`hover:bg-background-light transition-colors ${
						selectedUsers.some(u => u.azure_id === user.azure_id)
							? 'bg-background-light'
							: ''
					}`}
				>
					<Table.Cell className='font-medium'>
						<div className='flex items-center gap-2'>
							{user.name}
							{user.hasAccess ? (
								<Icon
									data={check_circle_outlined}
									title='User has access'
									className='text-text-success'
								/>
							) : (
								<Icon
									data={lock}
									title='User does not have access'
									className='text-text-danger min-w-6'
								/>
							)}
						</div>
					</Table.Cell>
					<Table.Cell className='px-2!'>
						<div className='flex justify-end'>
							<Button
								variant='outlined'
								className='transition-all'
								onClick={() =>
									handleAddUser({
										...user,
										id: crypto.randomUUID(),
										role: 'Member',
									})
								}
							>
								Add
							</Button>
						</div>
					</Table.Cell>
				</Table.Row>
			))}
		</Table.Body>
	</Table>
);

// Team Members Table Component
const TeamMembersTable = ({
	selectedUsers,
	errors,
	handleRoleChange,
	onDeleteUser,
}: {
	selectedUsers: UserWithRole[];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	errors: Record<string, any> | undefined;
	handleRoleChange: (user: UserWithRole, role: RoleType) => void;
	onDeleteUser: (user: UserWithRole) => void;
}) => (
	<Table className='w-full table-fixed'>
		<Table.Head className='bg-background-default sticky top-0 z-10'>
			<Table.Row>
				<Table.Cell className='w-1/2'>User Name</Table.Cell>
				<Table.Cell className='w-1/2'>Role</Table.Cell>
				<Table.Cell className='w-20'>Action</Table.Cell>
			</Table.Row>
		</Table.Head>
		<Table.Body>
			{selectedUsers.map((user, index) => (
				<Table.Row
					key={user.azure_id}
					className={`hover:bg-background-light transition-colors ${
						errors?.users && !user.role ? 'bg-warning' : ''
					}`}
				>
					<Table.Cell className='font-medium'>{user.name}</Table.Cell>
					<Table.Cell>
						<div>
							<Autocomplete
								options={roleTypes}
								label=''
								placeholder={'Search for roles'}
								onOptionsChange={({
									selectedItems,
								}: {
									selectedItems: RoleType[];
								}) => {
									handleRoleChange(user, selectedItems[0]);
								}}
								selectedOptions={user.role ? [user.role] : []}
							/>
						</div>
						{user.role === undefined && (
							<ErrorMessage
								as={FormErrorMessage}
								name={`users.${index}.role`}
								errors={errors}
							/>
						)}
					</Table.Cell>
					<Table.Cell className='px-2!'>
						<div className='flex justify-center'>
							<Button
								variant='ghost_icon'
								className='transition-colors hover:bg-red-50'
								onClick={() => onDeleteUser(user)}
							>
								<Icon data={delete_to_trash} />
							</Button>
						</div>
					</Table.Cell>
				</Table.Row>
			))}
		</Table.Body>
	</Table>
);

export const UserSection = ({ handleSubmit }: UserSectionProps) => {
	const { control } = useProjectFormContext();
	const [searchTerm, setSearchTerm] = useState('');
	const selectedProject = useSelectedProject();
	const {
		field: { value: usersValue, onChange: setUser },
		formState: { errors },
	} = useController({
		name: 'users',
		control: control,
	});
	const selectedUsers = usersValue || [];
	const debouncedSearchTerm = useDebounce(searchTerm, 300);

	const { users, hasActiveSearch } = useSearchUsers(debouncedSearchTerm);

	// Delete user from team members
	const handleDeleteUser = (user: UserWithRole) => {
		const updatedSelected = selectedUsers.filter(u => u.azure_id !== user.azure_id);
		setUser(updatedSelected);
		handleSubmit();
	};

	// Update role for a user
	const handleRoleChange = (user: UserWithRole, role: RoleType) => {
		setUser(selectedUsers.map(u => (u.azure_id === user.azure_id ? { ...u, role: role } : u)));
		handleSubmit();
	};

	// Persist selected users with roles
	const handleAddUser = async (user: UserWithRole) => {
		if (user.role && selectedProject) {
			setUser([...usersValue, { ...user, project_id: selectedProject.id }]);
			handleSubmit();
		}
	};

	// Derived state
	const teamMembersAzureIds = new Set(usersValue.map(u => u.azure_id));
	const baseUsers = hasActiveSearch
		? [...users.filter(gu => !teamMembersAzureIds.has(gu.azure_id))]
		: users;
	const availableUsers = baseUsers
		.filter(
			user => !selectedUsers.some(selectedUser => selectedUser.azure_id === user.azure_id),
		)
		.slice(0, LimitUserDisplay);

	const availableUsersCount = availableUsers.length;
	const teamMembersCount = selectedUsers.length;
	const showEmptySearch = hasActiveSearch && availableUsersCount === 0;
	const showIdleEmpty = !hasActiveSearch && availableUsersCount === 0;

	return (
		<div
			className='bg-background-default shadow-tile flex w-full flex-col
            	items-start gap-4 rounded-sm p-4'
		>
			<div className='grid gap-4 2xl:grid-cols-[600px_1fr]'>
				<div className='border-background-medium flex h-144 flex-col gap-4'>
					<div className='flex items-center justify-between'>
						<div>
							<div className='flex gap-2'>
								<h2 className='text-2xl font-semibold'>All Users</h2>
								<span className='bg-background-light flex w-8 items-center justify-center rounded-full'>
									{availableUsersCount}
								</span>
							</div>
							<p className='text-text-tertiary text-sm'>
								Search and add users to the project
							</p>
						</div>
					</div>
					<Search
						placeholder='Search users within equinor...'
						value={searchTerm}
						className='mb'
						onChange={e => {
							const nextSearch = e.target.value;
							setSearchTerm(nextSearch);
							// Filtering will happen after debounce completes
						}}
						aria-label='Search users'
					/>

					<div className='border-background-medium h-full overflow-y-auto rounded-md border'>
						{showEmptySearch ? (
							<div className='text-text-tertiary p-6 text-center text-sm'>
								No users found. Try a different search.
							</div>
						) : showIdleEmpty ? (
							<div className='text-text-tertiary p-6 text-center text-sm'>
								Search to add users from your tenant.
							</div>
						) : (
							<AllUsersTable
								availableUsers={availableUsers}
								selectedUsers={selectedUsers}
								handleAddUser={handleAddUser}
							/>
						)}
					</div>
				</div>
				<div className='border-background-medium flex h-144 flex-col gap-4'>
					<div className='flex items-center justify-between'>
						<div>
							<div className='flex gap-2'>
								<h2 className='text-2xl font-semibold'>Team members</h2>
								<span className='bg-background-light flex w-8 items-center justify-center rounded-full'>
									{teamMembersCount}
								</span>
							</div>
							<p className='text-text-tertiary text-sm'>
								Assign roles to team members
							</p>
						</div>
					</div>

					{selectedUsers.length > 0 || (usersValue && usersValue.length > 0) ? (
						<div className='flex min-h-0 flex-1 flex-col gap-3'>
							<div className='border-background-medium min-h-0 flex-1 overflow-y-auto rounded-md border'>
								<TeamMembersTable
									selectedUsers={selectedUsers}
									errors={errors}
									handleRoleChange={handleRoleChange}
									onDeleteUser={handleDeleteUser}
								/>
							</div>
						</div>
					) : (
						<div className='border-background-medium min-h-0 flex-1 overflow-y-auto rounded-md border'>
							<Table className='w-full table-fixed'>
								<Table.Head className='bg-background-default sticky top-0 z-10'>
									<Table.Row>
										<Table.Cell className='w-1/2'>User Name</Table.Cell>
										<Table.Cell className='w-1/2'>Role</Table.Cell>
										<Table.Cell className='w-20'> Action</Table.Cell>
									</Table.Row>
								</Table.Head>
								<Table.Body>
									<Table.Row>
										<Table.Cell
											className='text-text-tertiary py-6 text-center text-sm'
											colSpan={3}
										>
											No team members yet. Add users from the left to get
											started.
										</Table.Cell>
									</Table.Row>
								</Table.Body>
							</Table>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
