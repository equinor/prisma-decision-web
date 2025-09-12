import { Autocomplete } from '@equinor/eds-core-react';
import { useLocation, useNavigate } from 'react-router';
import { useCreateScenario } from '../../hooks/api/useCreateScenario';
import { useSelectedProject } from '../../hooks/useSelectedProject';
import { useSelectedScenario } from '../../hooks/useSelectedScenario';

export const ScenarioSelector = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const selectedProject = useSelectedProject();
	const selectedScenario = useSelectedScenario();
	const { mutate: createScenario, isPending } = useCreateScenario(data => {
		const isIssuePage = location.pathname.includes('issues');
		if (!isIssuePage) return navigate(`/project/${data.project_id}/${data.id}`);
		navigate(`/project/${data.project_id}/${data.id}/issues`);
	});
	if (!selectedProject || !selectedScenario) return null;
	return (
		<div className='flex h-[35px] flex-col-reverse'>
			<Autocomplete
				options={selectedProject.scenarios}
				hideClearButton
				loading={isPending}
				onAddNewOption={value => {
					createScenario({
						name: value,
						project_id: selectedProject.id,
						id: crypto.randomUUID(),
						objectives: [],
						opportunities: [],
						is_default: false,
					});
				}}
				className='**:box-content'
				selectedOptions={[selectedScenario]}
				optionLabel={option => option.name}
				label='Selected Scenario'
				onOptionsChange={({ selectedItems }) => {
					if (!selectedItems[0]) return;
					navigate(`../${selectedItems[0].id}`, {
						relative: 'path',
					});
				}}
			/>
		</div>
	);
};
