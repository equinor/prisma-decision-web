import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { DecisionQualityAssessment, DecisionQualityAssessmentSchema } from '../validators';
import { useCreateDecisionQualityAssessment } from './api/useCreateDecisionQualityAssessment';

type UseDecisionQualityAssessmentFormArgs = {
	assessmentId: string;
	onSuccess?: () => void;
};

const getDefaultValues = (assessmentId: string): DecisionQualityAssessment => ({
	id: crypto.randomUUID(),
	appropriate_frame: 5,
	trade_off_analysis: 5,
	reasoning_correctness: 5,
	information_reliability: 5,
	commitment_to_action: 5,
	doable_alternative: 5,
	comment: '',
	assessment_id: assessmentId,
	created_at: new Date().toISOString(),
});

export const useDecisionQualityAssessmentForm = ({
	assessmentId,
	onSuccess,
}: UseDecisionQualityAssessmentFormArgs) => {
	const formMethods = useForm<DecisionQualityAssessment>({
		defaultValues: getDefaultValues(assessmentId),
		resolver: zodResolver(DecisionQualityAssessmentSchema),
	});

	const { mutate: createDecisionQualityAssessment, isPending } =
		useCreateDecisionQualityAssessment({
			onSuccess: () => {
				formMethods.reset(getDefaultValues(assessmentId));
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
