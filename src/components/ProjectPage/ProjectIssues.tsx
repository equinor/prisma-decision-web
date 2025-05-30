import { useLocalStorage } from '@uidotdev/usehooks';
import '@xyflow/react/dist/style.css';
import { DiagramView } from './DiagramView/DiagramView';
import { ListView } from './ListView/ListView';
import { TableView } from './TableView/TableView';

export const ProjectIssues = () => {
	const [issueView] = useLocalStorage('issuesView', 'list');

	if (issueView === 'list') return <ListView />;
	if (issueView === 'table') return <TableView />;
	if (issueView === 'diagram') return <DiagramView />;
};
