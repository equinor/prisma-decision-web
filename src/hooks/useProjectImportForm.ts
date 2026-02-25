import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFormContext } from 'react-hook-form';
import { useState } from 'react';
import {
	ProjectImportData,
	projectImportFile,
	ProjectImportFile,
	projectImportSchema,
} from '../validators';
import { ZodError } from 'zod/v4';
import { useImportProject } from './api/useImportProject';

const DEFAULT_FORM_VALUES: ProjectImportFile = { projectJsonFile: undefined };

const parseFileContent = async (file: File): Promise<ProjectImportData> => {
	const text = await file.text();
	const json = JSON.parse(text);
	return projectImportSchema.parse(json);
};

const formatErrorMessage = (error: unknown, fileName: string): string[] => {
	const errors: string[] = [];

	if (error instanceof SyntaxError) {
		errors.push(`${fileName}: Invalid JSON format`);
	} else if (error instanceof ZodError) {
		errors.push(`Validation failed with the following issues in ${fileName}:`);
		error.issues.forEach(issue => {
			if (issue.path.length > 0) {
				errors.push(
					` "${issue.path[1] as string}" field is missing in "${issue.path[0] as string}"`,
				);
			}
		});
	} else {
		errors.push(`${fileName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}

	return errors;
};

const processFileResults = (
	results: PromiseSettledResult<ProjectImportData>[],
	fileList: FileList,
	setValidatedFiles: (fn: (prev: string[]) => string[]) => void,
	setFailedFiles: (fn: (prev: string[]) => string[]) => void,
): { validData: ProjectImportData[]; errors: string[] } => {
	const validData: ProjectImportData[] = [];
	const errors: string[] = [];

	results.forEach((result, index) => {
		const fileName = fileList[index]?.name || `File ${index + 1}`;

		if (result.status === 'fulfilled') {
			validData.push(result.value);
			setValidatedFiles(prev => [...prev, fileName]);
		} else {
			setFailedFiles(prev => [...prev, fileName]);
			const errorMessages = formatErrorMessage(result.reason, fileName);
			errors.push(...errorMessages);
		}
	});

	return { validData, errors };
};

export const useProjectImportFormContext = () => useFormContext<ProjectImportFile>();

export const useProjectImportForm = () => {
	const { mutate: importProject, isPending: isPendingCreate, isSuccess } = useImportProject();
	const [validatedFiles, setValidatedFiles] = useState<string[]>([]);
	const [failedFiles, setFailedFiles] = useState<string[]>([]);

	const formMethods = useForm<ProjectImportFile>({
		resolver: zodResolver(projectImportFile),
		values: DEFAULT_FORM_VALUES,
	});

	const handleSubmit = formMethods.handleSubmit(
		async data => {
			setValidatedFiles([]);
			setFailedFiles([]);
			const fileList = data.projectJsonFile;
			if (!fileList || fileList.length === 0) return;

			try {
				const results = await Promise.allSettled(
					Array.from(fileList).map(file => parseFileContent(file)),
				);

				const { validData, errors } = processFileResults(
					results,
					fileList,
					setValidatedFiles,
					setFailedFiles,
				);

				if (validData.length > 0) {
					importProject(validData);
				}

				if (errors.length > 0) {
					formMethods.setError('projectJsonFile', {
						message: errors.join('\n'),
					});
				}
			} catch (error) {
				formMethods.setError('projectJsonFile', {
					message: `Unexpected error processing files: ${error instanceof Error ? error.message : 'Unknown error'}`,
				});
			}
		},
		errors => console.error('Form errors:', errors),
	);

	return {
		formMethods,
		handleSubmit,
		isPending: isPendingCreate,
		isSuccess,
		validatedFiles,
		failedFiles,
	};
};
