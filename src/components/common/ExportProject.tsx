import { Button, Icon, Tooltip } from '@equinor/eds-core-react';
import { download } from '@equinor/eds-icons';
import { useGetEdges } from '../../hooks/api/useGetEdges';
import { useGetIssues } from '../../hooks/api/useGetIssues';
import { Edge, Issue, Project } from '../../validators';

export const ExportProject = ({ project }: DownloadProjectJsonButtonProps) => {
	const { issues } = useGetIssues();
	const { edges } = useGetEdges();
	const projectIssues: Issue[] = issues.filter(issue => issue.project_id === project.id);
	const projectEdges = edges.filter(edge => edge.project_id === project.id);

	const convertToJson = (data: { projects: Project; issues: Issue[]; edges: Edge[] }) => {
		const json = JSON.stringify(data, null, 2);
		const blob = new Blob([json], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${data.projects.name}.json`;
		a.click();
		URL.revokeObjectURL(url);
	};
	return (
		<Tooltip title='Click to download project as JSON format'>
			<Button
				variant='ghost_icon'
				label='Download project as JSON format'
				onClick={async e => {
					e.preventDefault();
					e.stopPropagation();

					convertToJson({
						projects: project,
						issues: projectIssues,
						edges: projectEdges,
					});
				}}
			>
				<Icon data={download} />
			</Button>
		</Tooltip>
	);
};

type DownloadProjectJsonButtonProps = {
	project: Project;
};
