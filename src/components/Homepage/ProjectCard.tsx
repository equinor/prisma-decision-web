import { Button, Chip, Icon, Tooltip } from '@equinor/eds-core-react';
import { star_filled, star_outlined } from '@equinor/eds-icons';
import { Link } from 'react-router';
import { useGetSignUser } from '../../hooks/api/useGetSignUser';
import { useToggleFavorite } from '../../hooks/api/useToggleFavorite';
import { Project } from '../../validators';

export const ProjectCard = ({ project }: ProjectCardProps) => {
	const { mutate: toggleFavorite } = useToggleFavorite();
	const { signuser } = useGetSignUser();
	const userRole = project.users.find(user => user.user_id === signuser?.user_id)?.role;

	return (
		<Link to={`/project/${project.id}`}>
			<div
				className='bg-background-default outline-background-medium
                hover:bg-background-light shadow-tile grid h-38 cursor-pointer
                grid-rows-[1fr_auto] overflow-hidden rounded-sm transition-all duration-1000
                hover:outline'
			>
				<div className='flex flex-col gap-2 overflow-hidden p-4'>
					<div className='relative flex justify-between gap-2'>
						<Tooltip title={`Click to navigate to project: ${project.name}`}>
							<h2 className='truncate pr-8 text-lg font-semibold'>{project.name}</h2>
						</Tooltip>
						<Button
							variant='ghost_icon'
							className='absolute! -top-2 -right-2'
							onClick={e => {
								e.preventDefault();
								toggleFavorite({
									projectId: project.id,
									favorite: !project.favorite,
								});
							}}
						>
							<Icon data={project.favorite ? star_filled : star_outlined} />
						</Button>
					</div>
					{userRole && (
						<Chip variant='default' className='w-fit'>
							{userRole}
						</Chip>
					)}
					{project.opportunity_statement && (
						<p className='text-text-secondary line-clamp-3 text-sm'>
							{project.opportunity_statement}
						</p>
					)}
				</div>
			</div>
		</Link>
	);
};

type ProjectCardProps = {
	project: Project;
};
