import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { SpiderAssessment, spiderAssessmentSchema } from '../validators';
import { useCreateSpiderAssessment } from './api/useCreateSpiderAssessment';

type UseSpiderAssessmentFormArgs = {
	assessmentId: string;
	onSuccess?: () => void;
};

const getDefaultValues = (assessmentId: string): SpiderAssessment => ({
	id: crypto.randomUUID(),
	value: 5,
	risk: 5,
	cost: 5,
	feasibility: 5,
	impact: 5,
	comment: '',
	assessment_id: assessmentId,
	created_at: new Date().toISOString(),
});

export const useSpiderAssessmentForm = ({
	assessmentId,
	onSuccess,
}: UseSpiderAssessmentFormArgs) => {
	const formMethods = useForm<SpiderAssessment>({
		defaultValues: getDefaultValues(assessmentId),
		resolver: zodResolver(spiderAssessmentSchema),
	});

	const { mutate: createSpiderAssessment, isPending } = useCreateSpiderAssessment({
		onSuccess: () => {
			formMethods.reset(getDefaultValues(assessmentId));
			onSuccess?.();
		},
	});

	const handleSubmit = formMethods.handleSubmit(
		data => createSpiderAssessment(data),
		errors => {
			// eslint-disable-next-line no-console
			console.error('Spider assessment form errors:', errors);
		},
	);

	return {
		...formMethods,
		handleSubmit,
		isPending,
	};
};
