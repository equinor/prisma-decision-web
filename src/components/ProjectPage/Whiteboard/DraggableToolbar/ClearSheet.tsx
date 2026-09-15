import { Button, Dialog, DialogContent, Icon } from '@equinor/eds-core-react';
import { delete_forever } from '@equinor/eds-icons';
import { useState } from 'react';
import { useDeleteWhiteboardNode } from '../../../../hooks/api/useDeleteWhiteboardNode';
import { useSelectedProjectWhiteboardNodes } from '../../../../hooks/useSelectedProjectWhiteboardNodes';
import useSelectedWhiteboardSheet from '../../../../hooks/useSelectedWhiteboardSheet';

export const ClearSheet = () => {
	const [isOpen, setIsOpen] = useState(false);
	const sheet = useSelectedWhiteboardSheet();
	const nodes = useSelectedProjectWhiteboardNodes().filter(
		node => node.data.board_sheet_id === sheet.id,
	);
	const { mutate: deleteWhiteboardNodes, isPending } = useDeleteWhiteboardNode();

	const handleClear = () => {
		deleteWhiteboardNodes(
			nodes.map(node => node.id),
			{ onSuccess: () => setIsOpen(false) },
		);
	};

	return (
		<>
			<Button
				disabled={nodes.length === 0}
				data-no-dnd
				className='px-1.5!'
				variant='outlined'
				title='Clear sheet'
				onClick={() => setIsOpen(true)}
			>
				<Icon data={delete_forever} />
			</Button>
			{isOpen && (
				<Dialog
					open
					data-no-dnd
					className='nodrag nopan nowheel fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform'
				>
					<DialogContent>
						<div className='flex flex-col gap-4 text-center'>
							<h2 className='text-2xl font-semibold'>Clear sheet</h2>
							<p className='text-text-tertiary'>
								You are about to delete all {nodes.length} items from {sheet.name}.
								This action cannot be undone.
							</p>
							<div className='flex flex-col gap-2'>
								<Button
									variant='outlined'
									disabled={isPending}
									onClick={() => setIsOpen(false)}
								>
									Cancel
								</Button>
								<Button color='danger' disabled={isPending} onClick={handleClear}>
									Clear sheet
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			)}
		</>
	);
};
