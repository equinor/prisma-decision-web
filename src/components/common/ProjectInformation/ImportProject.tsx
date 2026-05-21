import { Button, CircularProgress, Icon, Popover } from '@equinor/eds-core-react';
import { add, close } from '@equinor/eds-icons';
import { useCallback, useRef, useState } from 'react';
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
			.map(issue => `${fileName} - "${issue.path.join('->')}": ${issue.message}`);
	}
	return [`${fileName}: ${error instanceof Error ? error.message : 'Unknown error'}`];
};

const validateAndParseFiles = async (filesArray: File[]): Promise<FileValidationResult> => {
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

	return results.reduce(
		(acc, result, index) => {
			const fileName = filesArray[index]?.name || `File ${index + 1}`;

			if (result.status === 'fulfilled') {
				acc.validData.push({ fileName, data: result.value });
			} else {
				acc.errors.push(...formatContentError(result.reason, fileName));
			}
			return acc;
		},
		{ validData: [], errors: [] } as FileValidationResult,
	);
};

export const ImportProject = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
	const [validatedData, setValidatedData] = useState<
		{ fileName: string; data: ProjectImportData }[]
	>([]);
	const [errors, setErrors] = useState<string[]>([]);

	const { mutate: importProject, isPending } = useImportProject();
	const referenceElement = useRef<HTMLButtonElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const validateFiles = useCallback(async (files: File[]) => {
		if (files.length === 0) {
			setValidatedData([]);
			setErrors([]);
			return;
		}
		const { validData, errors: validationErrors } = await validateAndParseFiles(files);
		setValidatedData(validData);
		setErrors(validationErrors);
	}, []);

	const handleFileChange = (fileList: FileList | null) => {
		const files = fileList ? Array.from(fileList) : [];
		setSelectedFiles(files);
		validateFiles(files);
	};

	const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
		e.preventDefault();
		const files = e.dataTransfer.files;
		if (files) handleFileChange(files);
	};

	const handleImport = async () => {
		if (validatedData.length === 0) return;

		importProject(
			validatedData.map(item => item.data),
			{
				onSuccess: () => {
					setIsOpen(false);
					setErrors([]);
					setValidatedData([]);
					setSelectedFiles([]);
				},
			},
		);
	};

	const handleRemoveFile = (removeIndex: number) => {
		if (selectedFiles.length === 0) return;
		const newFiles = selectedFiles.filter((_, index) => index !== removeIndex);
		setSelectedFiles(newFiles);
		validateFiles(newFiles);
	};
	return (
		<>
			<Button
				ref={referenceElement}
				variant='outlined'
				onClick={() => {
					setIsOpen(prev => !prev);
				}}
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
					<div className='grid-col-1 grid gap-4'>
						<div className='w-full pr-16'>
							<h2 className='text-2xl font-semibold'>Import Project</h2>
							<p className='text-text-tertiary'>
								Select a JSON file. Only .json files are accepted.
							</p>
						</div>

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
								<div className='mt-2 w-full text-xs'>
									<p className='mb-2'>Files selected:</p>
									<ul className='flex flex-col gap-1'>
										{Array.from(selectedFiles).map((file, index) => (
											<li
												key={file.name}
												className='flex items-center justify-between'
											>
												<span className='truncate'>{file.name}</span>
												<Button
													type='button'
													variant='ghost_icon'
													onClick={e => {
														e.preventDefault();
														handleRemoveFile(index);
													}}
												>
													<Icon data={close} />
												</Button>
											</li>
										))}
									</ul>
								</div>
							)}
						</label>

						{errors.length > 0 && (
							<div className='w-full rounded-sm bg-red-100 p-2 text-sm text-red-800'>
								<p className='font-medium'>Validation Errors:</p>
								<ul className='list-disc pl-5'>
									{errors.map((error, index) => (
										<li key={index}>{error}</li>
									))}
								</ul>
							</div>
						)}

						{validatedData.length > 0 && (
							<div className='w-full rounded-sm bg-green-100 p-2 text-sm text-green-800'>
								<p className='font-medium'>Validation Success:</p>
								<ul className='list-disc pl-5'>
									{validatedData.map((item, index) => (
										<li key={index}>{item.fileName} Validated successfully</li>
									))}
								</ul>
							</div>
						)}

						<Button
							variant='ghost_icon'
							className='absolute! top-2 right-2'
							onClick={e => {
								e.stopPropagation();
								setIsOpen(false);
								setErrors([]);
								setValidatedData([]);
								setSelectedFiles([]);
							}}
						>
							<Icon data={close} />
						</Button>

						<Button
							className='w-max! justify-self-end'
							onClick={handleImport}
							disabled={isPending || validatedData.length === 0}
						>
							{isPending ? <CircularProgress size={16} /> : 'Import'}
						</Button>
					</div>
				</Popover.Content>
			</Popover>
		</>
	);
};

type FileValidationResult = {
	validData: { fileName: string; data: ProjectImportData }[];
	errors: string[];
};
