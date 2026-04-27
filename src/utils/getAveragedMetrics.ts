import { DecisionQualityAssessment, evaluationMetrics } from '../validators';

export type MetricScores = Record<string, number>;

export type AssessmentVariance = Record<string, 'high' | 'medium' | 'low'>;

export const getAveragedMetrics = (
	submissions: DecisionQualityAssessment[],
): MetricScores | null => {
	if (submissions.length === 0) return null;
	const submissionCount = submissions.length;

	return Object.fromEntries(
		evaluationMetrics.map(({ key }) => {
			const average =
				getMetricValues(submissions, key).reduce((sum, value) => sum + value, 0) /
				submissionCount;

			return [key, roundToSingleDecimal(average)] as const;
		}),
	) as MetricScores;
};

export const getMetricDifferences = (
	left?: MetricScores | null,
	right?: MetricScores | null,
): MetricScores => {
	const keys = new Set([...Object.keys(left ?? {}), ...Object.keys(right ?? {})]);

	return Object.fromEntries(
		Array.from(keys, key => [
			key,
			roundToSingleDecimal((left?.[key] ?? 0) - (right?.[key] ?? 0)),
		]),
	) as MetricScores;
};

export const getAssessmentVariance = (
	submissions: DecisionQualityAssessment[],
	highVarianceThreshold = 2,
): AssessmentVariance | null => {
	if (submissions.length === 0) return null;

	const mediumVarianceThreshold = highVarianceThreshold / 2;

	return Object.fromEntries(
		evaluationMetrics.map(({ key }) => {
			const values = getMetricValues(submissions, key);
			const average = values.reduce((sum, value) => sum + value, 0) / values.length;
			const variance =
				values.reduce((sum, value) => sum + (value - average) ** 2, 0) / values.length;
			const standardDeviation = Math.sqrt(variance);
			if (standardDeviation >= highVarianceThreshold) return [key, 'high'] as const;
			if (standardDeviation >= mediumVarianceThreshold) return [key, 'medium'] as const;
			return [key, 'low'] as const;
		}),
	) as AssessmentVariance;
};

const roundToSingleDecimal = (value: number) => Math.round(value * 10) / 10;

const getMetricValues = (submissions: DecisionQualityAssessment[], key: string) =>
	submissions.map(submission => Number(submission[key as keyof DecisionQualityAssessment] ?? 0));
