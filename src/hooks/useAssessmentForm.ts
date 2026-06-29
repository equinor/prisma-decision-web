import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Assessment, assessmentSchema } from '../validators';
import { useCreateAssessment } from './api/useCreateAssessment';
import { useUpdateAssessment } from './api/useUpdateAssessment';
import { useSelectedProject } from '../components/ProjectPage/ProjectContext';

const getDefaultValues = (projectId: string): Assessment => ({
	id: crypto.randomUUID(),
	name: '',
	is_completed: false,
	project_id: projectId,
	created_at: new Date().toISOString(),
});
type UseAssessmentFormArgs = {
	assessment?: Assessment;
	onSuccess?: (data: Assessment) => void;
};
export const useAssessmentForm = ({ assessment, onSuccess }: UseAssessmentFormArgs) => {
	const selectedProject = useSelectedProject();

	const defaultValues = useMemo(
		() => assessment || getDefaultValues(selectedProject.id),
		[selectedProject.id, assessment],
	);

	const formMethods = useForm({
		defaultValues,
		resolver: zodResolver(assessmentSchema),
	});

	const { mutate: createAssessment, isPending: isCreating } = useCreateAssessment();

	const { mutate: updateAssessment, isPending: isUpdating } = useUpdateAssessment();

	const handleSubmit = formMethods.handleSubmit(
		data => {
			const mutationFn = assessment ? updateAssessment : createAssessment;
			return mutationFn(
				{ ...data },
				{
					onSuccess: () => {
						formMethods.reset(getDefaultValues(selectedProject.id));
						onSuccess?.(data);
					},
				},
			);
		},
		errors => {
			// eslint-disable-next-line no-console
			console.error('Form errors:', errors);
		},
	);

	return {
		...formMethods,
		handleSubmit,
		isPending: isCreating || isUpdating,
	};
};
