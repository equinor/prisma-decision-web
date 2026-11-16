import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { AI_API_URL } from '../../aiApi';
import { quickStartResponseSchema, type QuickStartResponse } from '../../utils/quickStart';

type QuickStartRequest = {
	state: QuickStartResponse['state'] | null;
	action: 'answer' | 'confirm';
	message?: string;
	path?: string;
};

export const useSendQuickStartMessage = () =>
	useMutation({
		mutationFn: async (request: QuickStartRequest) => {
			const response = await axios.post<unknown>(`${AI_API_URL}/quick-start`, request, {
				timeout: 180000,
			});
			return quickStartResponseSchema.parse(response.data);
		},
	});
