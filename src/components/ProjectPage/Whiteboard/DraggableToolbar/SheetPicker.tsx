import { Button, EdsProvider, Icon, Menu, TextField } from '@equinor/eds-core-react';
import { add, check, close, delete_forever, edit } from '@equinor/eds-icons';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useCreateWhiteboardSheet } from '../../../../hooks/api/useCreateWhiteboardSheet';
import { useDeleteWhiteboardSheet } from '../../../../hooks/api/useDeleteWhiteboardSheet';
import { useUpdateWhiteboardSheets } from '../../../../hooks/api/useUpdateWhiteboardSheets';
import { useSelectedProjectWhiteboardSheets } from '../../../../hooks/useSelectedProjectWhiteboardSheets';
import useSelectedWhiteboardSheet from '../../../../hooks/useSelectedWhiteboardSheet';
import { WhiteboardSheet } from '../../../../validators';
import { useSelectedProject } from '../../ProjectContext';

export const SheetPicker = () => {
	const sheet = useSelectedWhiteboardSheet();
	const sheets = useSelectedProjectWhiteboardSheets();
	const selectedProject = useSelectedProject();
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
	const { mutate: CreateSheet } = useCreateWhiteboardSheet();
	const navigate = useNavigate();
	const [editing, setEditing] = useState<string | null>(null);
	return (
		<>
			<Button ref={setAnchorEl} variant='outlined' onClick={() => setIsOpen(true)}>
				{sheet?.name}
			</Button>
			<EdsProvider density='compact'>
				<Menu
					anchorEl={anchorEl}
					open={isOpen}
					onClose={() => setIsOpen(false)}
					placement='bottom-start'
				>
					{sheets.map(s =>
						editing === s.id ? (
							<EditSheetMenuItem
								sheet={s}
								onClose={() => setEditing(null)}
								key={s.id}
							/>
						) : (
							<SheetMenuItem
								sheet={s}
								onClickEdit={() => setEditing(s.id)}
								key={s.id}
							/>
						),
					)}
					<Menu.Item
						onClick={async () => {
							const id = crypto.randomUUID();
							CreateSheet({
								id,
								name: `Sheet ${sheets.length.toString()}`,
								project_id: selectedProject.id,
							});
							navigate(`/project/${selectedProject.id}/whiteboard/${id}`);
						}}
					>
						<Icon data={add} />
						New sheet
					</Menu.Item>
				</Menu>
			</EdsProvider>
		</>
	);
};

const SheetMenuItem = ({
	sheet,
	onClickEdit,
}: {
	sheet: WhiteboardSheet;
	onClickEdit: (sheet: WhiteboardSheet) => void;
}) => {
	const { mutate: DeleteSheet } = useDeleteWhiteboardSheet();
	const sheets = useSelectedProjectWhiteboardSheets();

	const selectedProject = useSelectedProject();
	return (
		<Menu.Item
			key={sheet.id}
			as={Link}
			to={`/project/${selectedProject.id}/whiteboard/${sheet.id}`}
		>
			<div>{sheet.name}</div>
			<div></div>
			<div>
				<Button
					variant='ghost_icon'
					onClick={e => {
						e.preventDefault();
						e.stopPropagation();
						onClickEdit(sheet);
					}}
				>
					<Icon data={edit} />
				</Button>
				<Button
					disabled={sheets.length === 1}
					variant='ghost_icon'
					onClick={e => {
						e.preventDefault();
						e.stopPropagation();
						DeleteSheet(sheet);
					}}
				>
					<Icon data={delete_forever} />
				</Button>
			</div>
		</Menu.Item>
	);
};

const EditSheetMenuItem = ({ sheet, onClose }: { sheet: WhiteboardSheet; onClose: () => void }) => {
	const [name, setName] = useState(sheet.name);
	const { mutate: updateSheet } = useUpdateWhiteboardSheets();
	return (
		<div
			className='grid grid-flow-col grid-cols-[1fr_auto] items-center gap-4 py-2 pr-6 pl-5'
			onKeyDownCapture={e => {
				e.stopPropagation();
				if (e.key === 'Enter') {
					updateSheet({ ...sheet, name });
					onClose();
				}
				if (e.key === 'Escape') {
					onClose();
				}
			}}
			role='none'
		>
			<TextField
				className='min-w-auto! select-text'
				onClick={e => {
					e.preventDefault();
					e.stopPropagation();
				}}
				type='text'
				value={name}
				onChange={e => {
					setName(e.target.value);
				}}
			/>
			<div className='flex'>
				<Button
					variant='ghost_icon'
					onClick={e => {
						e.preventDefault();
						e.stopPropagation();
						updateSheet({ ...sheet, name });
						onClose();
					}}
				>
					<Icon data={check} />
				</Button>
				<Button
					variant='ghost_icon'
					onClick={e => {
						e.preventDefault();
						e.stopPropagation();
						onClose();
					}}
				>
					<Icon data={close} />
				</Button>
			</div>
		</div>
	);
};
