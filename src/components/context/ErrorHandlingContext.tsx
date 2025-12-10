import React, { createContext, useState } from 'react';

interface IProps {
	children?: React.ReactNode;
}
import { ErrorHandlingState } from '../../validators';

const initialErrorHandlingState: ErrorHandlingState = {
	message: '',
	showDecisionTree: false,
};
export type ErrorHandlingContextType = {
	errorHandlingState: ErrorHandlingState;
	setErrorMessage: (msg: string) => void;
	setShowDecisionTree: (show: boolean) => void;
};

const ErrorHandlingContext = createContext<ErrorHandlingContextType>(
	{} as ErrorHandlingContextType,
);

const ErrorHandlingProvider = ({ children }: IProps) => {
	const [errorHandlingState, setErrorHandlingState] =
		useState<ErrorHandlingState>(initialErrorHandlingState);
	const setErrorMessage = (msg: string) => {
		setErrorHandlingState(prev => ({ ...prev, message: msg }));
	};

	const setShowDecisionTree = (show: boolean) => {
		setErrorHandlingState(prev => ({ ...prev, showDecisionTree: show }));
	};
	const value: ErrorHandlingContextType = {
		errorHandlingState,
		setErrorMessage,
		setShowDecisionTree,
	};
	return <ErrorHandlingContext.Provider value={value}>{children}</ErrorHandlingContext.Provider>;
};

export { ErrorHandlingContext, ErrorHandlingProvider };
