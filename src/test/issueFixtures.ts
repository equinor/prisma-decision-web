import { Issue, Project } from '../validators';

export const project: Project = {
	id: '00000000-0000-4000-8000-000000000001',
	name: 'Decision framing',
	public: false,
	favorite: false,
	parent_project_id: null,
	end_date: '2026-10-12T00:00:00Z',
	users: [],
};

export const existingIssue = (): Issue => {
	const id = '00000000-0000-4000-8000-000000000002';
	return {
		id,
		project_id: project.id,
		name: ' Existing issue ',
		description: ' First paragraph\nSecond paragraph ',
		type: 'Decision',
		boundary: 'out',
		order: 3,
		decision: {
			id: '00000000-0000-4000-8000-000000000003',
			issue_id: id,
			project_id: project.id,
			type: 'Tactical',
			options: [
				{
					id: '00000000-0000-4000-8000-000000000004',
					decision_id: '00000000-0000-4000-8000-000000000003',
					project_id: project.id,
					name: 'Existing option',
					utility: 7,
				},
			],
		},
		uncertainty: {
			id: '00000000-0000-4000-8000-000000000005',
			issue_id: id,
			project_id: project.id,
			is_key: true,
			outcomes: [
				{
					id: '00000000-0000-4000-8000-000000000006',
					uncertainty_id: '00000000-0000-4000-8000-000000000005',
					project_id: project.id,
					name: 'Existing outcome',
					utility: -2,
				},
			],
		},
		utility: {
			id: '00000000-0000-4000-8000-000000000007',
			issue_id: id,
			project_id: project.id,
		},
		value_metric: {
			id: '00000000-0000-4000-8000-000000000008',
			issue_id: id,
			name: 'Value',
		},
		node: {
			id: '00000000-0000-4000-8000-000000000009',
			issue_id: id,
			project_id: project.id,
			name: 'default',
			node_style: {
				id: '00000000-0000-4000-8000-000000000010',
				node_id: '00000000-0000-4000-8000-000000000009',
				x_position: 80,
				y_position: 120,
			},
		},
		created_at: '2026-10-01T00:00:00Z',
		updated_at: '2026-10-02T00:00:00Z',
	};
};
