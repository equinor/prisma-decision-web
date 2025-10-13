import { Divider, SideBar as EdsSideBar } from '@equinor/eds-core-react';
import {
	assignment_important,
	info_circle,
	measure,
	mood_happy,
	share,
	timeline,
} from '@equinor/eds-icons';
import { useState } from 'react';
import { Link } from 'react-router';
import { useSelectedProject } from '../hooks/useSelectedProject';
import { useSelectedScenario } from '../hooks/useSelectedScenario';
import { EquinorStar } from './EquinorStar';

export const SideBar = () => {
	const [isOpen, setIsOpen] = useState(false);
	const scenario = useSelectedScenario();
	const project = useSelectedProject();
	if (!scenario || !project) return <div />;
	return (
		<EdsSideBar
			className='h-[calc(100vh-64px)] !overflow-x-hidden !border-r-0'
			open={isOpen}
			onToggle={() => setIsOpen(prev => !prev)}
		>
			<EdsSideBar.Content>
				<EdsSideBar.Toggle className='[&_svg]:fill-primary-resting' />
				<Divider className='my-0!' />
				<p
					data-open={isOpen}
					className='pt-3 pb-2 text-xs data-[open="false"]:text-center data-[open="true"]:pl-6'
				>
					FRAME
				</p>

				<EdsSideBar.Link
					label='Project Information'
					icon={info_circle}
					className='[&_svg]:fill-primary-resting border-b-0!'
					as={Link}
					to={`/project/${project.id}/${scenario.id}`}
				/>
				<EdsSideBar.Link
					label='Opportunities'
					className='[&_svg]:fill-primary-resting border-b-0!'
					as={Link}
					icon={mood_happy}
					to={`/project/${project.id}/${scenario.id}/opportunities`}
				/>
				<EdsSideBar.Link
					label='Objectives'
					as={Link}
					className='[&_svg]:fill-primary-resting border-b-0!'
					icon={measure}
					to={`/project/${project.id}/${scenario.id}/objectives`}
				/>
				<EdsSideBar.Link
					label='Issues'
					as={Link}
					className='[&_svg]:fill-primary-resting border-b-0!'
					icon={assignment_important}
					to={`/project/${project.id}/${scenario.id}/issues`}
				/>
				<Divider className='my-0!' />
				<p
					data-open={isOpen}
					className='pt-3 pb-2 text-xs data-[open="false"]:text-center data-[open="true"]:pl-6'
				>
					STRUCTURE
				</p>
				<EdsSideBar.Link
					as={Link}
					label='Influence Diagram'
					className='[&_svg]:fill-primary-resting border-b-0!'
					icon={timeline}
					to={`/project/${project.id}/${scenario.id}/influence-diagram`}
				/>
				<EdsSideBar.Link
					as={Link}
					label='Decision Tree'
					className='[&_svg]:fill-primary-resting border-b-0!'
					icon={share}
					to={`/project/${project.id}/${scenario.id}/decision-tree`}
				/>
			</EdsSideBar.Content>
			<EdsSideBar.Footer>
				<div className='flex items-center justify-center py-4'>
					<EquinorStar />
				</div>
			</EdsSideBar.Footer>
		</EdsSideBar>
	);
};
