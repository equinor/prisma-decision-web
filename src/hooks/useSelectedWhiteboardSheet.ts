import { useParams } from 'react-router';
import { useSelectedProjectWhiteboardSheets } from './useSelectedProjectWhiteboardSheets';

const useSelectedWhiteboardSheet = () => {
	const { sheetId } = useParams<{ sheetId: string }>();
	const sheets = useSelectedProjectWhiteboardSheets();
	const sheet = sheets.find(s => s.id === sheetId);
	return sheet || sheets[0];
};

export default useSelectedWhiteboardSheet;
