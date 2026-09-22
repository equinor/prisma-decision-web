import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useSelectedProject } from '../components/ProjectPage/ProjectContext';
import { StakeholderMatrix, stakeholderMatrixSchema } from '../validators';
import { useCreateStakeholderMatrix } from './api/useCreateStakeholderMatrix';

export const useStakeholderMatrixForm = (args?: { onSuccess?: () => void }) => {
	const selectedProject = useSelectedProject();
	const formMethods = useForm<StakeholderMatrix>({
		defaultValues: getDefaultValues(selectedProject.id),
		resolver: zodResolver(stakeholderMatrixSchema),
	});
	const { mutate: createStakeholder, isPending } = useCreateStakeholderMatrix({
		onSuccess: () => {
			formMethods.reset(getDefaultValues(selectedProject.id));
			args?.onSuccess?.();
		},
	});

	return {
		...formMethods,
		handleSubmit: formMethods.handleSubmit(data => createStakeholder(data)),
		isPending,
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
