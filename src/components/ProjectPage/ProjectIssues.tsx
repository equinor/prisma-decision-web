import { useLocalStorage } from '@uidotdev/usehooks';
import { ListView } from './ListView/ListView';
import { TableView } from './TableView/TableView';

export const ProjectIssues = () => {
	const [issueView] = useLocalStorage('issuesView', 'list');
	if (issueView === 'list') return <ListView />;
	if (issueView === 'table') return <TableView />;
};
