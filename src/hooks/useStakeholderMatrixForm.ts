import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useSelectedProject } from '../components/ProjectPage/ProjectContext';
import { StakeholderMatrix, stakeholderMatrixSchema } from '../validators';
import { useCreateStakeholderMatrix } from './api/useCreateStakeholderMatrix';
import { useUpdateStakeholderMatrix } from './api/useUpdateStakeholderMatrix';

export const useStakeholderMatrixForm = (args?: {
	stakeholder?: StakeholderMatrix;
	onSuccess?: () => void;
}) => {
	const selectedProject = useSelectedProject();
	const formMethods = useForm<StakeholderMatrix>({
		values: args?.stakeholder ?? getDefaultValues(selectedProject.id),
		resolver: zodResolver(stakeholderMatrixSchema),
	});
	const { mutate: createStakeholder, isPending: isCreating } = useCreateStakeholderMatrix({
		onSuccess: () => {
			formMethods.reset(getDefaultValues(selectedProject.id));
			args?.onSuccess?.();
		},
	});
	const { mutate: updateStakeholder, isPending: isUpdating } = useUpdateStakeholderMatrix({
		onSuccess: args?.onSuccess,
	});

	return {
		...formMethods,
		handleSubmit: formMethods.handleSubmit(data =>
			args?.stakeholder ? updateStakeholder(data) : createStakeholder(data),
		),
		isPending: isCreating || isUpdating,
	};
};

const getDefaultValues = (projectId: string): StakeholderMatrix => ({
	stakeholder_matrix_id: crypto.randomUUID(),
	stakeholder_name: '',
	stakeholder_role: '',
	affected_by_the_decision: 0,
	affecting_the_decision: 0,
	project_id: projectId,
});
