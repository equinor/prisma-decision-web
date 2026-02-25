import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFormContext } from 'react-hook-form';
import { useMemo } from 'react';
import {
	ProjectImportData,
	projectImportFile,
	ProjectImportFile,
	projectImportSchema,
} from '../validators';
import { ZodError } from 'zod/v4';
import { useImportProject } from './api/useImportProject';

const getDefaultValues = (): ProjectImportFile => ({
	projectJsonFile: undefined,
});

export const useProjectImportFormContext = () => useFormContext<ProjectImportFile>();
export const useProjectImportForm = () => {
	const { mutate: importProject, isPending: isPendingCreate, isSuccess } = useImportProject();

	const formDefaults = useMemo(() => {
		// Use selectedProject if available, otherwise use fresh defaults
		return getDefaultValues();
	}, []);

	const formMethods = useForm<ProjectImportFile>({
		resolver: zodResolver(projectImportFile),
		values: formDefaults,
	});

	const handleSubmit = formMethods.handleSubmit(
		async data => {
			const file = data.projectJsonFile;
			if (file && file.length > 0) {
				const parsedWithProjectImportSchema: ProjectImportData[] = [];
				try {
					await Promise.all(
						Array.from(file).map(async file => {
							const text = await file.text();
							const json = JSON.parse(text);
							parsedWithProjectImportSchema.push(projectImportSchema.parse(json));
						}),
					);
					importProject(parsedWithProjectImportSchema);
				} catch (error) {
					if (error instanceof SyntaxError) {
						formMethods.setError('projectJsonFile', {
							message: 'Invalid JSON format',
						});
					} else if (error instanceof ZodError) {
						const firstError = error.issues[0];
						const path = firstError.path.join('.');
						formMethods.setError('projectJsonFile', {
							message: `Validation failed at "${path}": ${firstError.message}`,
						});
					} else {
						formMethods.setError('projectJsonFile', {
							message: 'File does not match project schema',
						});
					}
				}
			}
		},
		errors => {
			//eslint-disable-next-line no-console
			console.error('Form errors:', errors);
		},
	);

	return {
		formMethods,
		handleSubmit,
		isPending: isPendingCreate,
		isSuccess,
	};
};
