import { Issue } from '../validators';

export const createIssueDraft = (projectId: string): Issue => {
	const id = crypto.randomUUID();
	return {
		boundary: 'in',
		name: '',
		description: '',
		type: 'Unassigned',
		id,
		order: 0,
		project_id: projectId,
		decision: {
			id: crypto.randomUUID(),
			issue_id: id,
			project_id: projectId,
			type: 'Policy',
			options: [],
		},
		uncertainty: {
			id: crypto.randomUUID(),
			issue_id: id,
			project_id: projectId,
			is_key: false,
			outcomes: [],
		},
		utility: {
			id: crypto.randomUUID(),
			issue_id: id,
			project_id: projectId,
		},
		value_metric: {
			id: '288e0811-7ab6-5d24-b80c-9fa925b848a6',
			issue_id: id,
			name: '',
		},
		node: {
			id: crypto.randomUUID(),
			issue_id: id,
			name: 'default',
			project_id: projectId,
			node_style: {
				id: crypto.randomUUID(),
				node_id: crypto.randomUUID(),
				x_position: 0,
				y_position: 0,
			},
		},
	};
};
