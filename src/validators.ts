import { uuid, z } from 'zod/v4';

const opportunitySchema = z.object({
	id: uuid(),
	name: z.string().min(1, 'Opportunity name is required'),
	description: z.string().min(1, 'Description is required'),
});

const objectiveSchema = z.object({
	id: uuid(),
	name: z.string().min(1, 'Objective name is required'),
	description: z.string().min(1, 'Description is required'),
});

export const scenarioSchema = z.object({
	id: uuid(),
	name: z.string().min(1, 'Scenario name is required'),
	project_id: uuid(),
	objectives: z.array(objectiveSchema),
	opportunities: z.array(opportunitySchema),
});

export const projectSchema = z.object({
	description: z.string().min(1, 'Description is required'),
	name: z.string().min(1, 'Name is required'),
	id: uuid(),
	scenarios: z.array(scenarioSchema),
});

export type Project = z.infer<typeof projectSchema>;
