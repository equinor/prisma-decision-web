import { parseISO } from 'date-fns';
import type { Project } from '../validators';

export const getDefaultProjectValues = (): Project => ({
	name: '',
	opportunity_statement: '',
	public: false,
	end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
	id: crypto.randomUUID(),
	favorite: false,
	parent_project_id: null,
	users: [],
});

export const getProjectFromIntake = (
	defaults: Project,
	information: {
		project_name: string;
		opportunity_statement: string;
		end_date: string | null;
		public_project: boolean | null;
	},
): Project => ({
	...defaults,
	name: information.project_name,
	opportunity_statement: information.opportunity_statement,
	end_date: information.end_date
		? parseISO(information.end_date).toISOString()
		: defaults.end_date,
	public: information.public_project ?? defaults.public,
});
