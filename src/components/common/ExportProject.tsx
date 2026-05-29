import { Button, Icon, Tooltip } from '@equinor/eds-core-react';
import { download } from '@equinor/eds-icons';
import { useGetEdges } from '../../hooks/api/useGetEdges';
import { useGetIssues } from '../../hooks/api/useGetIssues';
import { Assessment, Edge, Issue, Project } from '../../validators';
import { useGetAssessments } from '../../hooks/api/useGetAssessments';

export const ExportProject = ({ project, showLabel }: DownloadProjectJsonButtonProps) => {
	const { issues } = useGetIssues();
	const { edges } = useGetEdges();
	const assessments = useGetAssessments().assessments.filter(a => a.project_id === project.id);

	const projectIssues: Issue[] = issues.filter(issue => issue.project_id === project.id);
	const projectEdges = edges.filter(edge => edge.project_id === project.id);

	const convertToJson = (data: {
		projects: Project;
		issues: Issue[];
		edges: Edge[];
		assessments: Assessment[];
	}) => {
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
				variant={showLabel ? 'outlined' : 'ghost_icon'}
				label='Download project as JSON format'
				onClick={async e => {
					e.preventDefault();
					e.stopPropagation();

					convertToJson({
						projects: project,
						issues: projectIssues,
						edges: projectEdges,
						assessments: assessments,
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
