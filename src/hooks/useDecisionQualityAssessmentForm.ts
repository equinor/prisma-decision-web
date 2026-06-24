import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { DecisionQualityAssessment, DecisionQualityAssessmentSchema } from '../validators';
import { useCreateDecisionQualityAssessment } from './api/useCreateDecisionQualityAssessment';
import { useGetSignUser } from './api/useGetSignUser';

type UseDecisionQualityAssessmentFormArgs = {
	assessmentId: string;
	projectId: string;
	onSuccess?: () => void;
};

const getDefaultValues = (
	assessmentId: string,
	userId: string,
	projectId: string,
): DecisionQualityAssessment => ({
	id: crypto.randomUUID(),
	appropriate_frame: 50,
	trade_off_analysis: 50,
	reasoning_correctness: 50,
	information_reliability: 50,
	commitment_to_action: 50,
	doable_alternatives: 50,
	comment: '',
	assessment_id: assessmentId,
	project_id: projectId,
	created_by_id: userId,
	created_at: new Date().toISOString(),
});

export const useDecisionQualityAssessmentForm = ({
	assessmentId,
	projectId,
	onSuccess,
}: UseDecisionQualityAssessmentFormArgs) => {
	const { signuser } = useGetSignUser();
	const userId = signuser?.user_id ?? '';

	const formMethods = useForm<DecisionQualityAssessment>({
		defaultValues: getDefaultValues(assessmentId, userId, projectId),
		resolver: zodResolver(DecisionQualityAssessmentSchema),
	});

	const { mutate: createDecisionQualityAssessment, isPending } =
		useCreateDecisionQualityAssessment({
			onSuccess: () => {
				formMethods.reset(getDefaultValues(assessmentId, userId, projectId));
				onSuccess?.();
			},
		});

	const handleSubmit = formMethods.handleSubmit(
		data => createDecisionQualityAssessment(data),
		errors => {
			// eslint-disable-next-line no-console
			console.error('DecisionQuality assessment form errors:', errors);
		},
	);

	return {
		formMethods,
		handleSubmit,
		isPending,
	};
};
