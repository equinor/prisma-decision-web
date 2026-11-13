import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { z } from 'zod';

export const useGetOpeningQuestion = (assistant: 'chat' | 'quick-start', enabled: boolean) =>
	useQuery({
		queryKey: [assistant, 'opening-question'],
		queryFn: async ({ signal }) => {
			const response = await axios.get<unknown>(`/ai-api/${assistant}/opening-question`, {
				signal,
				timeout: 10000,
			});
			return z.object({ question: z.string().trim().min(1) }).parse(response.data).question;
		},
		enabled,
		staleTime: Infinity,
		retry: false,
		// The chat shows its own retry message.
		meta: { hideErrorToast: true },
	});
