import { CreateIssues } from '../CreateIssue';
import { useIssuesContext } from '../ProjectPage';
import { Decisions } from './Decisions';
import { Facts } from './Facts';
import { Unassgined } from './Unassigned';
import { Uncertainties } from './Uncertainties';
import { Values } from './Values';

export const ListView = () => {
	const { issues } = useIssuesContext();
	return (
		<>
			<CreateIssues />
			<Unassgined issues={issues['Unassigned']} />
			<Decisions issues={issues['Decision']} />
			<Uncertainties issues={issues['Uncertainty']} />
			<Values issues={issues['Value']} />
			<Facts issues={issues['Fact']} />
		</>
	);
};
