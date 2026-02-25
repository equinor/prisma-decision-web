import { Button, CircularProgress, Icon, Popover } from '@equinor/eds-core-react';
import { add, close } from '@equinor/eds-icons';
import { useRef, useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { useProjectImportForm } from '../../../hooks/useProjectImportForm';
export const ImportProject = () => {
	const [isOpen, setIsOpen] = useState(false);
	const { formMethods, isPending, handleSubmit, isSuccess } = useProjectImportForm();
	const {
		register,
		watch,
		formState: { errors },
	} = formMethods;

	const referenceElement = useRef<HTMLButtonElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { ref: projectJsonFileRef, ...projectJsonFileField } = register('projectJsonFile');
	const selectedFileName = (watch('projectJsonFile') as FileList | undefined) ?? null;

	return (
		<>
			<Button
				ref={referenceElement}
				variant='outlined'
				onClick={() => setIsOpen(prev => !prev)}
			>
				<Icon data={add} />
				Import Project
			</Button>
			<Popover
				open={isOpen && !isSuccess}
				onClose={() => setIsOpen(false)}
				anchorEl={referenceElement.current}
			>
				<Popover.Content className='relative w-[min(543px,90vw)]'>
					<FormProvider {...formMethods}>
						<form
							onSubmit={handleSubmit}
							className='flex flex-col items-start gap-4 rounded-sm'
						>
							<h2 className='text-lg font-semibold'>Import Project</h2>
							<p className='text-text-secondary text-sm'>
								Select a JSON file. Only .json files are accepted.
							</p>

							<label
								htmlFor='projectJsonFile'
								className='text-text-secondary w-full rounded-md border border-dashed border-slate-300 p-4 text-sm hover:border-slate-400'
								onDragOver={e => e.preventDefault()}
								onDrop={e => {
									e.preventDefault();
									const file = e.dataTransfer.files?.[0];
									if (file && fileInputRef.current) {
										const dt = new DataTransfer();
										dt.items.add(file);
										fileInputRef.current.files = dt.files;
										fileInputRef.current.dispatchEvent(
											new Event('change', { bubbles: true }),
										);
									}
								}}
							>
								<p className='mb-2'>Drag & drop JSON here</p>
								<Button
									type='button'
									variant='outlined'
									onClick={() => fileInputRef.current?.click()}
								>
									Choose File
								</Button>
								<input
									id='projectJsonFile'
									className='hidden'
									type='file'
									multiple
									accept='.json,application/json'
									{...projectJsonFileField}
									ref={el => {
										projectJsonFileRef(el);
										fileInputRef.current = el;
									}}
									onChange={e => {
										projectJsonFileField.onChange(e);
									}}
								/>
								{selectedFileName && selectedFileName.length > 0 && (
									<div className='flex items-center text-xs'>
										<p className='mr-2'>
											File selected:{' '}
											{Array.from(selectedFileName)
												.map(file => file.name)
												.join(', ')}
										</p>
										<Button
											type='button'
											variant='ghost_icon'
											onClick={() => {
												if (fileInputRef.current) {
													const dt = new DataTransfer();
													fileInputRef.current.files = dt.files;
													fileInputRef.current.dispatchEvent(
														new Event('change', { bubbles: true }),
													);
												}
											}}
										>
											<Icon data={close} />
										</Button>
									</div>
								)}
							</label>

							{errors.projectJsonFile && (
								<p className='text-sm text-red-500'>
									{errors.projectJsonFile.message}
								</p>
							)}
							<Button
								variant='ghost_icon'
								className='absolute! top-0.5 right-2'
								onClick={e => {
									e.stopPropagation();
									setIsOpen(false);
								}}
							>
								<Icon data={close} />
							</Button>

							<Button className='md:self-end' type='submit' disabled={isPending}>
								{isPending ? <CircularProgress size={16} /> : 'Create Project'}
							</Button>
						</form>
					</FormProvider>
				</Popover.Content>
			</Popover>
		</>
	);
};
