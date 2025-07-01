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
			<Unassgined issues={issues['unassigned']} />
			<Decisions issues={issues['decision']} />
			<Uncertainties issues={issues['uncertainty']} />
			<Values issues={issues['value']} />
			<Facts issues={issues['fact']} />
		</>
	);
};
