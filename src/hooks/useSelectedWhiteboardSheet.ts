import { useParams } from 'react-router';
import { useGetWhiteboardSheets } from './api/useGetWhiteboardSheets';

const useSelectedWhiteboardSheet = () => {
	const { sheetId } = useParams<{ sheetId: string }>();
	const { data: sheets } = useGetWhiteboardSheets();
	const sheet = sheets.find(s => s.id === sheetId);
	return sheet || sheets[0];
};

export default useSelectedWhiteboardSheet;
