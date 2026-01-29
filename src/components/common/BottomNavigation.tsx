import { Button, Icon } from '@equinor/eds-core-react';
import { arrow_back, arrow_forward } from '@equinor/eds-icons';
import { useNavigate } from 'react-router';

interface NavButton {
	label: string;
	to: string;
	disabled?: boolean;
}

interface BottomNavigationProps {
	back?: NavButton;
	next?: NavButton;
}

export const BottomNavigation = ({ back, next }: BottomNavigationProps) => {
	const navigate = useNavigate();

	return (
		<div className='fixed right-0 bottom-0 left-[64px] flex flex-row justify-between p-4'>
			{back ? (
				<Button
					variant='outlined'
					disabled={back.disabled}
					onClick={() => navigate(back.to)}
				>
					<Icon data={arrow_back} />
					{back.label}
				</Button>
			) : (
				<div />
			)}
			{next ? (
				<Button
					variant='outlined'
					disabled={next.disabled}
					onClick={() => navigate(next.to)}
				>
					{next.label}
					<Icon data={arrow_forward} />
				</Button>
			) : (
				<div />
			)}
		</div>
	);
};
