import { Dialog, Typography, Button } from '@equinor/eds-core-react';
import styled from 'styled-components';

const Wrapper = styled.div`
	display: flex;
	gap: 8px;
`;

type ProjectAssignmentDialogProps = {
	isProjectAssignmentDialogOpen: boolean;
	onClose: (value: React.SetStateAction<boolean>) => void;
};

export const ProjectAssignmentDialog = ({
	isProjectAssignmentDialogOpen,
	onClose,
}: ProjectAssignmentDialogProps) => {
	const handleClose = () => {
		onClose(false);
	};

	return (
		<Dialog
			open={isProjectAssignmentDialogOpen}
			className='nodrag fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform'
		>
			<Dialog.Header>
				<Dialog.Title>Role assignment</Dialog.Title>
			</Dialog.Header>
			<Dialog.CustomContent>
				<Typography variant='body_short'>Small description here.</Typography>
			</Dialog.CustomContent>
			<Dialog.Actions>
				<Wrapper>
					<Button onClick={handleClose}>OK</Button>
					<Button variant='ghost' onClick={handleClose}>
						Cancel
					</Button>
				</Wrapper>
			</Dialog.Actions>
		</Dialog>
	);
};
