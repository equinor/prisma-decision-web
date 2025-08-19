import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { roleAssignmentSchema } from '../validators';
import { useCreateRoleAssignment } from './api/useCreateProjectRoleAssignment';

const defaultValues = {
	user_ids: [],
	project_id: '',
	role: '',
};

export const useProjectRoleAssignmentForm = () => {
	const {
		mutate: createRoleAssignment,
		isPending: isPendingCreate,
		data: createResponse,
	} = useCreateRoleAssignment();
	const formMethods = useForm({
		values: {
			...defaultValues,
		},
		resolver: zodResolver(roleAssignmentSchema),
	});

	const handleSubmit = formMethods.handleSubmit(
		async data => {
			await createRoleAssignment(data);
			formMethods.reset();
		},
		errors => {
			// eslint-disable-next-line no-console
			console.error('Form errors:', errors);
		},
	);

	return {
		...formMethods,
		handleSubmit,
		isPending: isPendingCreate,
		data: createResponse,
	};
};
