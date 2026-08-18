import { Button, Icon, Tooltip } from '@equinor/eds-core-react';
import { download } from '@equinor/eds-icons';
import { useGetEdges } from '../../hooks/api/useGetEdges';
import { useGetIssues } from '../../hooks/api/useGetIssues';
import { Edge, Issue, Project } from '../../validators';

export const ExportProject = ({ project, showLabel }: DownloadProjectJsonButtonProps) => {
	const { issues, isSuccess: issuesReady } = useGetIssues();
	const { edges, isSuccess: edgesReady } = useGetEdges();
	// Both hooks default to an empty array, so an unresolved *and* a failed
	// query both look like "this project has no issues". Guarding on
	// isSuccess rather than isLoading closes both: a failed query is not
	// loading, and exporting then writes a valid-looking file with the whole
	// decision model missing. It also cannot be a test on the arrays
	// themselves, because a project may legitimately have none.
	const ready = issuesReady && edgesReady;
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
		<Tooltip
			title={ready ? 'Click to download project as JSON format' : 'Loading project data…'}
		>
			<Button
				variant={showLabel ? 'outlined' : 'ghost_icon'}
				label='Download project as JSON format'
				disabled={!ready}
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
				{showLabel && 'Download'}
			</Button>
		</Tooltip>
	);
};

type DownloadProjectJsonButtonProps = {
	project: Project;
	showLabel?: boolean;
};
