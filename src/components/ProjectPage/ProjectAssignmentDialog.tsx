import { Dialog, Typography, Button, Table } from '@equinor/eds-core-react';
import styled from 'styled-components';

const Wrapper = styled.div`
	display: flex;
	gap: 8px;
`;

type ProjectAssignmentDialogProps = {
	isProjectAssignmentDialogOpen: boolean;
	selectedProjectId: string;
	selectedProjectName: string;
	onClose: (value: React.SetStateAction<boolean>) => void;
};

export const ProjectAssignmentDialog = ({
	isProjectAssignmentDialogOpen,
	selectedProjectName,
	onClose,
}: ProjectAssignmentDialogProps) => {
	const handleClose = () => {
		onClose(false);
	};

	return (
		<Dialog
			open={isProjectAssignmentDialogOpen}
			className='fixed top-1/2 left-1/2 min-w-2xl -translate-x-1/2 -translate-y-1/2 transform'
		>
			<Dialog.Header>
				<Dialog.Title>Role Assignment in {selectedProjectName}</Dialog.Title>
			</Dialog.Header>
			<Dialog.CustomContent>
				<Table className='w-full'>
					<Table.Head>
						<Table.Row>
							<Table.Cell>Project Name</Table.Cell>
							<Table.Cell>Users</Table.Cell>
							<Table.Cell>Role</Table.Cell>
						</Table.Row>
					</Table.Head>
					<Table.Body>
						<Table.Row>
							<Table.Cell>{selectedProjectName}</Table.Cell>
							<Table.Cell>Kiwi</Table.Cell>
							<Table.Cell>1.5</Table.Cell>
						</Table.Row>
					</Table.Body>
				</Table>
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
