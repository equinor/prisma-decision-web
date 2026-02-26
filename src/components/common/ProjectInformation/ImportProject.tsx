import { Button, CircularProgress, Icon, Popover } from '@equinor/eds-core-react';
import { add, close } from '@equinor/eds-icons';
import { useRef, useState } from 'react';
import { ZodError } from 'zod/v4';
import { ProjectImportData, projectImportSchema, projectImportFile } from '../../../validators';
import { useImportProject } from '../../../hooks/api/useImportProject';

const parseFileContent = async (file: File): Promise<ProjectImportData> => {
	const text = await file.text();
	const json = JSON.parse(text);
	return projectImportSchema.parse(json);
};

const formatContentError = (error: unknown, fileName: string): string[] => {
	if (error instanceof SyntaxError) {
		return [`${fileName}: Invalid JSON format`];
	}
	if (error instanceof ZodError) {
		return error.issues
			.filter(issue => issue.path.length > 0)
			.map(
				issue =>
					`${fileName} - "${String(issue.path[1])}" field missing in "${String(issue.path[0])}"`,
			);
	}
	return [`${fileName}: ${error instanceof Error ? error.message : 'Unknown error'}`];
};

const validateAndParseFiles = async (
	filesArray: File[],
): Promise<{ validData: ProjectImportData[]; errors: string[] }> => {
	// Validate file format first
	const fileValidation = projectImportFile.safeParse(filesArray);
	if (!fileValidation.success) {
		const errors = fileValidation.error.issues.map(issue => {
			const index = issue.path[0] as number;
			return `${filesArray[index]?.name}: ${issue.message}`;
		});
		return { validData: [], errors };
	}

	// Parse file contents
	const results = await Promise.allSettled(filesArray.map(parseFileContent));
	const validData: ProjectImportData[] = [];
	const errors: string[] = [];

	results.forEach((result, index) => {
		const fileName = filesArray[index]?.name || `File ${index + 1}`;

		if (result.status === 'fulfilled') {
			validData.push(result.value);
		} else {
			errors.push(...formatContentError(result.reason, fileName));
		}
	});

	return { validData, errors };
};

export const ImportProject = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
	const [validatedFiles, setValidatedFiles] = useState<string[]>([]);
	const [errors, setErrors] = useState<string[]>([]);

	const { mutate: importProject, isPending } = useImportProject();
	const referenceElement = useRef<HTMLButtonElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = (fileList: FileList | null) => {
		setSelectedFiles(fileList);
	};

	const handleClearFiles = () => {
		setSelectedFiles(null);
		setValidatedFiles([]);
		setErrors([]);
		if (fileInputRef.current) {
			const dt = new DataTransfer();
			fileInputRef.current.files = dt.files;
		}
	};

	const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
		e.preventDefault();
		const files = e.dataTransfer.files;
		if (files && fileInputRef.current) {
			const dt = new DataTransfer();
			Array.from(files).forEach(file => dt.items.add(file));
			fileInputRef.current.files = dt.files;
			handleFileChange(dt.files);
		}
	};

	const handleImport = async () => {
		if (!selectedFiles || selectedFiles.length === 0) return;

		setValidatedFiles([]);
		setErrors([]);

		const filesArray = Array.from(selectedFiles);
		const { validData, errors: validationErrors } = await validateAndParseFiles(filesArray);

		// Set results
		filesArray.forEach((_, index) => {
			const fileName = filesArray[index]?.name || `File ${index + 1}`;
			if (validData.some((_, i) => i === index)) {
				setValidatedFiles(prev => [...prev, fileName]);
			}
		});

		if (validationErrors.length > 0) {
			setErrors(validationErrors);
		}

		if (validData.length > 0) {
			importProject(validData);
		}
	};

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
				open={isOpen || errors.length > 0}
				onClose={() => setIsOpen(false)}
				anchorEl={referenceElement.current}
			>
				<Popover.Content className='relative w-[min(543px,90vw)]'>
					<div className='flex flex-col items-start gap-4 rounded-sm'>
						<h2 className='text-lg font-semibold'>Import Project</h2>
						<p className='text-text-secondary text-sm'>
							Select a JSON file. Only .json files are accepted.
						</p>

						<label
							htmlFor='projectJsonFile'
							className='text-text-secondary w-full cursor-pointer rounded-md border border-dashed border-slate-300 p-4 text-sm hover:border-slate-400'
							onDragOver={e => e.preventDefault()}
							onDrop={handleDrop}
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
								ref={fileInputRef}
								onChange={e => handleFileChange(e.target.files)}
							/>
							{selectedFiles && selectedFiles.length > 0 && (
								<div className='mt-2 flex items-center text-xs'>
									<p className='mr-2'>
										File selected:{' '}
										{Array.from(selectedFiles)
											.map(file => file.name)
											.join(', ')}
									</p>
									<Button
										type='button'
										variant='ghost_icon'
										onClick={e => {
											e.preventDefault();
											handleClearFiles();
										}}
									>
										<Icon data={close} />
									</Button>
								</div>
							)}
						</label>

						{errors.length > 0 && (
							<div className='w-full rounded-sm bg-red-100 p-2 text-sm text-red-800'>
								<p className='font-medium'>Import Errors:</p>
								<ul className='list-disc pl-5'>
									{errors.map((error, index) => (
										<li key={index}>{error}</li>
									))}
								</ul>
							</div>
						)}

						{validatedFiles.length > 0 && (
							<div className='w-full rounded-sm bg-green-100 p-2 text-sm text-green-800'>
								<p className='font-medium'>Successfully imported:</p>
								<ul className='list-disc pl-5'>
									{validatedFiles.map((file, index) => (
										<li key={index}>{file} created successfully</li>
									))}
								</ul>
							</div>
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

						<Button
							className='md:self-end'
							onClick={handleImport}
							disabled={isPending || !selectedFiles || selectedFiles.length === 0}
						>
							{isPending ? <CircularProgress size={16} /> : 'Import'}
						</Button>
					</div>
				</Popover.Content>
			</Popover>
		</>
	);
};
