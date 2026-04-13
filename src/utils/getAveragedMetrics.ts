import { DecisionQualityAssessment, evaluationMetrics } from '../validators';

export const getAveragedMetrics = (
	submissions: DecisionQualityAssessment[],
): Record<string, number> | null => {
	if (submissions.length === 0) return null;
	return evaluationMetrics.reduce<Record<string, number>>((acc, m) => {
		const sum = submissions.reduce(
			(total, s) => total + ((s[m.key as keyof DecisionQualityAssessment] as number) ?? 0),
			0,
		);
		acc[m.key] = Math.round((sum / submissions.length) * 10) / 10;
		return acc;
	}, {});
};
