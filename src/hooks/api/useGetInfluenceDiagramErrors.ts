import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api';
import z from 'zod/v4';

export const useGetInfluenceDiagramErrors = (projectId?: string) => {
	const { data, ...rest } = useQuery({
		queryKey: ['influenceDiagramErrors', projectId],
		queryFn: async () => {
			try {
				await apiClient.get(`/structure/${projectId}/influence_diagram`);
			} catch (error) {
				return parseDecisionTreeError(error);
			}
			return INITIAL_ERROR_STATE;
		},
		enabled: !!projectId,
	});
	return { data, ...rest };
};

export const parseDecisionTreeError = (error: unknown) => {
	if (!error) return INITIAL_ERROR_STATE;
	const res = { ...INITIAL_ERROR_STATE };
	const parsedError = errorValidator.safeParse(error);
	if (parsedError.success) {
		res.message = parsedError.data.response.data.detail;
		res.showDecisionTree = true;
	}
	return res;
};

const INITIAL_ERROR_STATE: ErrorHandlingState = {
	message: '',
	showDecisionTree: false,
};

const errorValidator = z.object({
	response: z.object({
		data: z.object({
			detail: z.string(),
		}),
	}),
});

type ErrorHandlingState = {
	message: string;
	showDecisionTree: boolean;
};
