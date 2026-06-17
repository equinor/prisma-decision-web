import { Button, Divider, SideBar as EdsSideBar, Icon, Popover } from '@equinor/eds-core-react';
import {
	assignment_important,
	functions,
	info_circle,
	measure,
	share,
	star_outlined,
	timeline,
} from '@equinor/eds-icons';
import { useRef, useState } from 'react';
import { Link } from 'react-router';
import { useSelectedProject } from '../hooks/useSelectedProject';
import { ChessIcon, compactTreeIcon } from '../icons';
import { EquinorStar } from './EquinorStar';

import { cn } from '../utils/cn';
import { usePendingAssessmentCount } from '../hooks/api/usePendingAssessmentCount';

export const SideBar = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [isDecisionTreeMenuOpen, setIsDecisionTreeMenuOpen] = useState(false);
	const decisionTreeButtonRef = useRef<HTMLButtonElement>(null);
	const project = useSelectedProject();
	const pendingCount = usePendingAssessmentCount();
	let decisionTreeIcon = share;
	if (window.location.pathname.includes('compact-tree')) {
		decisionTreeIcon = compactTreeIcon;
	} else if (window.location.pathname.includes('solution-tree')) {
		decisionTreeIcon = functions;
	}
	if (!project) return <div />;
	return (
		<EdsSideBar
			className='h-[calc(100vh-64px)] overflow-x-hidden! border-r-0!'
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
					active={window.location.pathname === `/project/${project.id}`}
					label='Project Information'
					icon={info_circle}
					className='[&_svg]:fill-primary-resting border-b-0!'
					as={Link}
					to={`/project/${project.id}`}
				/>

				<EdsSideBar.Link
					active={window.location.pathname.includes('objectives')}
					label='Objectives'
					as={Link}
					className='[&_svg]:fill-primary-resting border-b-0!'
					icon={measure}
					to={`/project/${project.id}/objectives`}
				/>
				<EdsSideBar.Link
					active={window.location.pathname.includes('issues')}
					label='Issues'
					as={Link}
					className='[&_svg]:fill-primary-resting border-b-0!'
					icon={assignment_important}
					to={`/project/${project.id}/issues`}
				/>
				<EdsSideBar.Link
					label='Strategies'
					active={window.location.pathname.includes('strategies')}
					as={Link}
					className='[&_svg]:fill-primary-resting border-b-0! [&_svg]:ml-0.5! [&_svg]:size-5!'
					icon={ChessIcon}
					to={`/project/${project.id}/strategies`}
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
					active={window.location.pathname.includes('influence-diagram')}
					className='[&_svg]:fill-primary-resting border-b-0! [&_svg]:w-full!'
					icon={timeline}
					to={`/project/${project.id}/influence-diagram`}
				/>
				<EdsSideBar.Link
					ref={decisionTreeButtonRef}
					onClick={() => setIsDecisionTreeMenuOpen(prev => !prev)}
					label='Decision Tree'
					active={
						window.location.pathname.includes('decision-tree') ||
						window.location.pathname.includes('compact-tree') ||
						window.location.pathname.includes('solution-tree')
					}
					className='[&_svg]:fill-primary-resting border-b-0!'
					icon={decisionTreeIcon}
				/>
				<Popover
					open={isDecisionTreeMenuOpen}
					placement='right'
					onClose={() => setIsDecisionTreeMenuOpen(false)}
					anchorEl={decisionTreeButtonRef.current}
				>
					<Popover.Content className='flex flex-col gap-2 p-2!'>
						<Button
							variant='ghost'
							className='size-16! [&>span]:flex! [&>span]:flex-col!'
							as={Link}
							onClick={() => setIsDecisionTreeMenuOpen(false)}
							to={`/project/${project.id}/decision-tree`}
						>
							<Icon data={share} />
							Tree
						</Button>
						<Button
							variant='ghost'
							className='size-16! [&>span]:flex! [&>span]:flex-col!'
							as={Link}
							onClick={() => setIsDecisionTreeMenuOpen(false)}
							to={`/project/${project.id}/compact-tree`}
						>
							<Icon data={compactTreeIcon} />
							Compact
						</Button>
						<Button
							variant='ghost'
							className='size-16! [&>span]:flex! [&>span]:flex-col!'
							onClick={() => setIsDecisionTreeMenuOpen(false)}
							as={Link}
							to={`/project/${project.id}/solution-tree`}
						>
							<Icon data={functions} />
							Solution
						</Button>
					</Popover.Content>
				</Popover>
				<Divider className='my-0!' />
				<p
					data-open={isOpen}
					className='pt-3 pb-2 text-xs data-[open="false"]:text-center data-[open="true"]:pl-6'
				>
					EVALUATE
				</p>
				<EdsSideBar.Link
					as={Link}
					label='Assessments'
					active={window.location.pathname.includes('assessments')}
					className={cn(
						'[&_svg]:fill-primary-resting relative border-b-0! [&_svg]:w-full!',
						{
							'after:absolute after:top-6.5 after:right-6.5 after:size-2.5 after:animate-pulse after:rounded-full after:bg-red-600':
								pendingCount > 0,
						},
					)}
					icon={star_outlined}
					to={`/project/${project.id}/assessments`}
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
