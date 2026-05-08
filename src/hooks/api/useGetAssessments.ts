import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Assessment } from '../../validators';
import { showErrorToast } from '../../components/ShowToast';

const defaultAssessments: Assessment[] = [];
export const useGetAssessments = () => {
	const { data } = useQuery({
		queryKey: ['assessments'],
		queryFn: async () => {
			try {
				const res = await apiClient.get<Assessment[]>('/assessments');
				return res.data.toSorted((a, b) => b.created_at.localeCompare(a.created_at));
			} catch {
				showErrorToast('Failed to fetch assessments');
			}
		},
	});

	return {
		assessments: data || defaultAssessments,
	};
};
