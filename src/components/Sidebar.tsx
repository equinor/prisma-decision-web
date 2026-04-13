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
import { usePendingAssessmentCount } from '../hooks/usePendingAssessmentCount';

export const SideBar = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [isDecisionTreeMenuOpen, setIsDecisionTreeMenuOpen] = useState(false);
	const decisionTreeButtonRef = useRef<HTMLButtonElement>(null);
	const project = useSelectedProject();
	const pendingCount = usePendingAssessmentCount();
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
					label='Project Information'
					icon={info_circle}
					className='[&_svg]:fill-primary-resting border-b-0!'
					as={Link}
					to={`/project/${project.id}`}
				/>

				<EdsSideBar.Link
					label='Objectives'
					as={Link}
					className='[&_svg]:fill-primary-resting border-b-0!'
					icon={measure}
					to={`/project/${project.id}/objectives`}
				/>
				<EdsSideBar.Link
					label='Issues'
					as={Link}
					className='[&_svg]:fill-primary-resting border-b-0!'
					icon={assignment_important}
					to={`/project/${project.id}/issues`}
				/>
				<EdsSideBar.Link
					label='Strategies'
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
					className='[&_svg]:fill-primary-resting border-b-0! [&_svg]:w-full!'
					icon={timeline}
					to={`/project/${project.id}/influence-diagram`}
				/>
				<EdsSideBar.Link
					ref={decisionTreeButtonRef}
					onClick={() => setIsDecisionTreeMenuOpen(prev => !prev)}
					label='Decision Tree'
					className='[&_svg]:fill-primary-resting border-b-0!'
					icon={share}
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
				<div className='relative'>
					<EdsSideBar.Link
						as={Link}
						label='Assessments'
						className='[&_svg]:fill-primary-resting border-b-0! [&_svg]:w-full!'
						icon={star_outlined}
						to={`/project/${project.id}/assessments`}
					/>
					{pendingCount > 0 && (
						<span className='absolute top-1 right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white'>
							{pendingCount}
						</span>
					)}
				</div>
			</EdsSideBar.Content>
			<EdsSideBar.Footer>
				<div className='flex items-center justify-center py-4'>
					<EquinorStar />
				</div>
			</EdsSideBar.Footer>
		</EdsSideBar>
	);
};
