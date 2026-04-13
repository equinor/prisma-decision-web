import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { DecisionQualityAssessment, DecisionQualityAssessmentSchema } from '../validators';
import { useCreateDecisionQualityAssessment } from './api/useCreateDecisionQualityAssessment';
import { useGetSignUser } from './api/useGetSignUser';

type UseDecisionQualityAssessmentFormArgs = {
	assessmentId: string;
	onSuccess?: () => void;
};

const getDefaultValues = (assessmentId: string, userId: string): DecisionQualityAssessment => ({
	id: crypto.randomUUID(),
	appropriate_frame: 5,
	trade_off_analysis: 5,
	reasoning_correctness: 5,
	information_reliability: 5,
	commitment_to_action: 5,
	doable_alternatives: 5,
	comment: '',
	assessment_id: assessmentId,
	created_by_id: userId,
	created_at: new Date().toISOString(),
});

export const useDecisionQualityAssessmentForm = ({
	assessmentId,
	onSuccess,
}: UseDecisionQualityAssessmentFormArgs) => {
	const { signuser } = useGetSignUser();
	const userId = signuser?.user_id ?? '';

	const formMethods = useForm<DecisionQualityAssessment>({
		defaultValues: getDefaultValues(assessmentId, userId),
		resolver: zodResolver(DecisionQualityAssessmentSchema),
	});

	const { mutate: createDecisionQualityAssessment, isPending } =
		useCreateDecisionQualityAssessment({
			onSuccess: () => {
				formMethods.reset(getDefaultValues(assessmentId, userId));
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
		...formMethods,
		handleSubmit,
		isPending,
	};
};
