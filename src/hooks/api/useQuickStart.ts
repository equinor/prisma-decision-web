import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
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
			const response = await axios.post<unknown>('/ai-api/quick-start', request, {
				timeout: 180000,
			});
			return quickStartResponseSchema.parse(response.data);
		},
	});
