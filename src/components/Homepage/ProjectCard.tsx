import { Button, Chip, Icon } from '@equinor/eds-core-react';
import { delete_to_trash, download } from '@equinor/eds-icons';
import { Link } from 'react-router';

export const ProjectCard = () => {
	return (
		<Link to={'/project/1'}>
			<div
				className='bg-background-default outline-background-medium
			hover:bg-background-light shadow-tile h-[180px] w-[456px]
			cursor-pointer rounded-sm transition-all duration-1000 hover:outline'
			>
				<div className='p-6'>
					<div className='flex justify-between gap-5'>
						<h2 className='truncate text-lg font-semibold'>
							The Used Car Buyer Problem
						</h2>
						<Chip variant='active' className='dark:text-text-default!'>
							Open
						</Chip>
					</div>
					<p className='text-text-tertiary line-clamp-2'>
						Decision analysis for used car purchases Decision analysis for used car
						purchases Decision analysis for used car purchases Decision analysis for
						used car purchases
					</p>
				</div>
				<div className='border-background-medium flex justify-between border-t-1 px-3 py-2'>
					<Button variant='ghost_icon'>
						<Icon data={delete_to_trash} />
					</Button>
					<Button variant='ghost_icon'>
						<Icon data={download} />
					</Button>
				</div>
			</div>
		</Link>
	);
};
