import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { z } from 'zod';
import {
	chatInterviewResponseSchema,
	getChatStrategyContext,
	type ChatInterviewResponse,
} from '../../utils/chatInterview';
import type { Issue, Objective, Strategy } from '../../validators';
import type { ChatSection } from '../../utils/chatPageContext';
import { loadChatDiagram, type DiagramContext } from './useChatDiagram';

const projectInformationSchema = z.object({
	project_name: z.string().trim().min(1).nullable(),
	opportunity_statement: z.string().trim().min(1).nullable(),
	end_date: z.iso.date().nullable(),
	public_project: z.boolean().nullable(),
});

const parkedNotesSchema = z.array(
	z.object({
		id: z.string(),
		target: z.enum(['objectives', 'issues', 'strategies', 'other']),
		summary: z.string(),
		suggestion: z.string(),
		user_quote: z.string(),
		status: z.enum(['open', 'resolved']),
	}),
);
const conversationLogSchema = z.array(z.record(z.string(), z.string()));

const chatReplySchema = z.discriminatedUnion('status', [
	z.object({
		reply: z.string().trim().min(1),
		status: z.literal('collecting'),
		project_information: projectInformationSchema,
		parked_notes: parkedNotesSchema.default([]),
		conversation_log: conversationLogSchema.default([]),
	}),
	z.object({
		reply: z.string().trim().min(1),
		status: z.literal('ready'),
		project_information: projectInformationSchema.extend({
			project_name: z.string().trim().min(1),
			opportunity_statement: z.string().trim().min(1),
		}),
		parked_notes: parkedNotesSchema.default([]),
		conversation_log: conversationLogSchema.default([]),
	}),
	chatInterviewResponseSchema,
	z.object({
		reply: z.string().trim().min(1),
		status: z.literal('next_step'),
	}),
]);

export type ChatIntakeResponse = z.infer<typeof chatReplySchema>;

type ChatIntakeRequest = {
	message: string;
	project_information?: z.infer<typeof projectInformationSchema>;
	question: string;
	next_step?: boolean;
	saved_project?: boolean;
	project_id?: string;
	parked_notes?: z.infer<typeof parkedNotesSchema>;
	conversation_log?: z.infer<typeof conversationLogSchema>;
	current_section?: ChatSection;
	existing_objectives?: { objectives: Objective[] };
	existing_issues?: { issues: Issue[] };
	existing_strategies?: { strategies: Strategy[] };
	diagram_context?: DiagramContext;
	interview?: {
		state: ChatInterviewResponse['state'];
		action: 'answer' | 'confirm';
		message?: string;
		path?: string;
		current_section?: ChatSection;
	};
};

export const getChatErrorMessage = (error: Error | null) => {
	if (axios.isAxiosError<unknown>(error)) {
		const response = z.object({ detail: z.string() }).safeParse(error.response?.data);
		if (response.success) return response.data.detail;
	}
	if (error && !axios.isAxiosError(error) && !(error instanceof z.ZodError)) return error.message;
	return 'Could not process your message. Check that the Python API is running and its AI model is configured, then try again.';
};

export const useSendChatMessage = () =>
	useMutation({
		mutationFn: async ({ next_step, interview, ...request }: ChatIntakeRequest) => {
			if ((interview?.current_section ?? request.current_section) === 'influence_diagram') {
				const projectId = interview?.state.project_id ?? request.project_id;
				if (!projectId) throw new Error('A saved project is required for diagram chat.');
				const context = await loadChatDiagram(projectId);
				request.diagram_context = context;
				request.existing_issues = { issues: context.issues };
			}
			const startOnPage = !interview && request.current_section !== undefined;
			const endpoint =
				interview || startOnPage
					? '/ai-api/chat/interview'
					: next_step
						? '/ai-api/chat/next-step'
						: '/ai-api/chat/messages';
			const existing_strategies = request.existing_strategies
				? {
						strategies: getChatStrategyContext(
							request.existing_strategies.strategies,
							request.existing_issues?.issues ?? [],
						),
					}
				: undefined;
			// The interview also gets the saved items, so edits made on the pages are respected.
			const payload = interview
				? {
						...interview,
						existing_objectives: request.existing_objectives,
						existing_issues: request.existing_issues,
						existing_strategies,
						diagram_context: request.diagram_context,
					}
				: startOnPage
					? {
							project_id: request.project_id,
							current_section: request.current_section,
							message: request.message,
							parked_notes: request.parked_notes,
							conversation_log: request.conversation_log,
							diagram_context: request.diagram_context,
							project: {
								project_information: request.project_information,
								objectives: request.existing_objectives,
								issues: request.existing_issues,
								strategies: existing_strategies,
							},
						}
					: { ...request, existing_strategies };
			const response = await axios.post<unknown>(endpoint, payload, {
				timeout: 120000,
			});
			return chatReplySchema.parse(response.data);
		},
	});
