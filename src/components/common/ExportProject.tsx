import { Button, Icon, Tooltip } from '@equinor/eds-core-react';
import { download } from '@equinor/eds-icons';
import { useGetEdges } from '../../hooks/api/useGetEdges';
import { useGetIssues } from '../../hooks/api/useGetIssues';
import { useGetObjectives } from '../../hooks/api/useGetObjectives';
import { useGetPolicyTable } from '../../hooks/api/useGetPolicyTable';
import { useGetProbabilityTables } from '../../hooks/api/useGetProbabilityTables';
import { useGetRestrictionTables } from '../../hooks/api/useGetRestrictionTables';
import { useGetUtilityTables } from '../../hooks/api/useGetUtilityTables';
import {
	DiscreteProbability,
	DiscreteUtility,
	Edge,
	Issue,
	Objective,
	PolicyTableWithParentOptionOutcome,
	Project,
	RestrictionTable,
} from '../../validators';

export const ExportProject = ({ project, showLabel }: DownloadProjectJsonButtonProps) => {
	const { issues } = useGetIssues();
	const { edges } = useGetEdges();
	const { objectives } = useGetObjectives();
	const { data: probabilityTables } = useGetProbabilityTables();
	const { data: utilityTables } = useGetUtilityTables();
	const { restrictionTables } = useGetRestrictionTables();
	const { policyTable } = useGetPolicyTable();
	const projectIssues: Issue[] = issues.filter(issue => issue.project_id === project.id);
	const projectEdges = edges.filter(edge => edge.project_id === project.id);
	const projectObjectives: Objective[] = objectives.filter(
		objective => objective.project_id === project.id,
	);
	const projectIssueIds = new Set(projectIssues.map(issue => issue.id));
	const projectDiscreteProbabilities: DiscreteProbability[] = probabilityTables
		.filter(table => projectIssueIds.has(table.issue_id))
		.flatMap(table => table.discrete_probabilities);
	const projectDiscreteUtilities: DiscreteUtility[] = utilityTables
		.filter(table => projectIssueIds.has(table.issue_id))
		.flatMap(table => table.discrete_utilities);
	const projectRestrictionTables: RestrictionTable[] = restrictionTables.filter(
		table => table.project_id === project.id,
	);

	const convertToJson = (data: {
		projects: Project;
		Objectives: Objective[];
		issues: Issue[];
		edges: Edge[];
		discrete_probabilities: DiscreteProbability[];
		discrete_utilities: DiscreteUtility[];
		restriction_tables: RestrictionTable[];
		policy_table: PolicyTableWithParentOptionOutcome[];
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
						Objectives: projectObjectives,
						issues: projectIssues,
						edges: projectEdges,
						discrete_probabilities: projectDiscreteProbabilities,
						discrete_utilities: projectDiscreteUtilities,
						restriction_tables: projectRestrictionTables,
						policy_table: policyTable,
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
