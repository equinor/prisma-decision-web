import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { WhiteboardSheet } from '../../validators';

const defaultValue: WhiteboardSheet[] = [];
export const useGetWhiteboardSheets = () => {
	const query = useQuery({
		queryKey: ['whiteboardSheets'],
		queryFn: async () => {
			const res = await apiClient.get<WhiteboardSheet[]>('/board_sheets');
			return res.data;
		},
	});
	return {
		...query,
		data: query.data ?? defaultValue,
	};
};
