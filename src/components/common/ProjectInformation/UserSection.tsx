import { Autocomplete, Button, Icon, Table } from '@equinor/eds-core-react';
import { delete_to_trash, lock } from '@equinor/eds-icons';
import { useState } from 'react';
import { useController } from 'react-hook-form';
import { useGetUsers } from '../../../hooks/api/useGetUsers';
import { useSearchUsers } from '../../../hooks/api/useSearchUsers';
import { useProjectFormContext } from '../../../hooks/useProjectForm';
import { ProjectRole, RoleType, roleTypes, User } from '../../../validators';
import { ErrorMessage } from '@hookform/error-message';
import { FormErrorMessage } from '../FormErrorMessage';
import { useSelectedProject } from '../../../hooks/useSelectedProject';
import { useDebounce } from '@uidotdev/usehooks';

type UserSectionProps = {
	handleSubmit: () => void;
};

type UserWithRole = User & { id: string; role?: RoleType };

// All Users Table Component
const AllUsersTable = ({
	availableUsers,
	existingAzureIds,
	selectedUsers,
	onAddUser,
}: {
	availableUsers: User[];
	existingAzureIds: Set<string>;
	selectedUsers: UserWithRole[];
	onAddUser: (user: User) => void;
}) => (
	<Table className='w-full table-fixed'>
		<Table.Head className='bg-background-default sticky top-0 z-10'>
			<Table.Row>
				<Table.Cell className='w-1/2'>User Name</Table.Cell>
				<Table.Cell className='flex justify-end'>Action</Table.Cell>
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
							{!existingAzureIds.has(user.azure_id) && (
								<Icon
									data={lock}
									title='User does not have access'
									className='text-ui-warning'
								/>
							)}
						</div>
					</Table.Cell>
					<Table.Cell className='px-2!'>
						<div className='flex justify-end'>
							<Button
								variant='outlined'
								className='transition-all'
								onClick={() => onAddUser(user)}
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
	onRoleChange,
	onDeleteUser,
}: {
	selectedUsers: UserWithRole[];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	errors: Record<string, any> | undefined;
	onRoleChange: (user: UserWithRole, role: RoleType | undefined) => void;
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
						errors?.users && !user.role ? 'bg-red-50' : ''
					}`}
				>
					<Table.Cell className='font-medium'>{user.name}</Table.Cell>
					<Table.Cell>
						<div>
							<Autocomplete
								options={roleTypes}
								label='Assign Role'
								placeholder={'Search for roles'}
								onOptionsChange={({
									selectedItems,
								}: {
									selectedItems: RoleType[];
								}) => {
									onRoleChange(user, selectedItems[0]);
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
	const { users } = useGetUsers();
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

	const { filteredUsers, graphUsers, hasActiveSearch } = useSearchUsers(
		debouncedSearchTerm,
		users,
	);

	// Delete user from team members
	const handleDeleteUser = (user: UserWithRole) => {
		const updatedSelected = selectedUsers.filter(u => u.azure_id !== user.azure_id);
		setUser(updatedSelected);
	};

	// Update role for a user
	const handleRoleAssignment = (user: UserWithRole, role: RoleType | undefined) => {
		setUser(selectedUsers.map(u => (u.azure_id === user.azure_id ? { ...u, role } : u)));
	};

	// Persist selected users with roles
	const handleRoleCreate = async () => {
		if (selectedUsers.length > 0 && selectedProject) {
			const userWithRole: ProjectRole[] = selectedUsers.map(user => ({
				...user,
				role: user.role!,
				project_id: selectedProject.id,
			}));
			setUser(userWithRole);
			handleSubmit();
		}
	};

	// Derived state
	const existingAzureIds = new Set(users.map(u => u.azure_id));
	const baseUsers = hasActiveSearch
		? [...filteredUsers, ...graphUsers.filter(gu => !existingAzureIds.has(gu.azure_id))]
		: users;

	const availableUsers = baseUsers.filter(
		user => !selectedUsers.some(selectedUser => selectedUser.azure_id === user.azure_id),
	);

	const totalUsersCount = baseUsers.length;
	const visibleUsersCount = availableUsers.length;
	const countLabel = hasActiveSearch
		? `${visibleUsersCount} of ${totalUsersCount} users`
		: `${visibleUsersCount} users`;
	const showEmptySearch = hasActiveSearch && availableUsers.length === 0;
	const showIdleEmpty = !hasActiveSearch && availableUsers.length === 0;
	const teamCountLabel = selectedUsers.length > 0 ? `${selectedUsers.length} members` : '';

	return (
		<div className='flex flex-col gap-4'>
			<div className='space-y-2'>
				<h2 className='text-2xl font-semibold'>Roles</h2>
				<p className='text-text-tertiary'>
					Manage users that have access to the project and their roles
				</p>
			</div>
			<div className='w-full overflow-x-auto'>
				<div className='grid min-w-[980px] grid-cols-[600px_minmax(560px,1fr)] gap-4'>
					<div className='border-background-medium flex h-[36rem] flex-col gap-4 rounded-lg border p-4 shadow-sm'>
						<div className='flex items-center justify-between'>
							<div>
								<h3 className='mb-1 text-lg font-semibold'>All Users</h3>
								<p className='text-text-tertiary text-sm'>
									Search and add users to the project
								</p>
							</div>
							<span className='text-text-tertiary text-sm'>{countLabel}</span>
						</div>
						<div className='relative'>
							<input
								type='text'
								placeholder='Search users within equinor...'
								value={searchTerm}
								className='border-background-medium bg-background-default focus:ring-primary-resting focus:border-primary-resting w-full rounded-md border px-3 py-2 pr-10 text-sm transition-all focus:ring-2 focus:outline-none'
								onChange={e => {
									const nextSearch = e.target.value;
									setSearchTerm(nextSearch);
									// Filtering will happen after debounce completes
								}}
								aria-label='Search users'
							/>

							{searchTerm && (
								<button
									type='button'
									className='text-text-tertiary hover:text-text-primary absolute top-1/2 right-3 -translate-y-1/2 text-sm'
									onClick={() => {
										setSearchTerm('');
									}}
								>
									✕
								</button>
							)}
						</div>

						<div className='border-background-medium min-h-0 flex-1 overflow-y-auto rounded-md border'>
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
									existingAzureIds={existingAzureIds}
									selectedUsers={selectedUsers}
									onAddUser={user => {
										setUser([
											...selectedUsers,
											{ ...user, id: crypto.randomUUID(), role: undefined },
										]);
									}}
								/>
							)}
						</div>
					</div>
					<div className='border-background-medium flex h-[36rem] flex-col gap-4 rounded-lg border p-4 shadow-sm'>
						<div className='flex items-center justify-between'>
							<div>
								<h3 className='mb-1 text-lg font-semibold'>Team members</h3>
								<p className='text-text-tertiary text-sm'>
									Assign roles to team members
								</p>
							</div>
							{teamCountLabel && (
								<span className='text-text-tertiary text-sm'>{teamCountLabel}</span>
							)}
						</div>

						{selectedUsers.length > 0 || (usersValue && usersValue.length > 0) ? (
							<div className='flex min-h-0 flex-1 flex-col gap-3'>
								<div className='border-background-medium min-h-0 flex-1 overflow-y-auto rounded-md border'>
									<TeamMembersTable
										selectedUsers={selectedUsers}
										errors={errors}
										onRoleChange={handleRoleAssignment}
										onDeleteUser={handleDeleteUser}
									/>
								</div>
								<div className='flex justify-end'>
									<Button onClick={() => handleRoleCreate()}>Assign roles</Button>
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
		</div>
	);
};
