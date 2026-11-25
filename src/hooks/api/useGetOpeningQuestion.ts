import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { aiClient } from '../../aiApi';

export const useGetOpeningQuestion = (assistant: 'chat' | 'quick-start', enabled: boolean) =>
	useQuery({
		queryKey: [assistant, 'opening-question'],
		queryFn: async ({ signal }) => {
			const response = await aiClient.get<unknown>(`/${assistant}/opening-question`, {
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
