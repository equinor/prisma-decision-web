import { CreateIssues } from '../CreateIssue';
import { Decisions } from './Decisions';
import { Facts } from './Facts';
import { Unassgined } from './Unassigned';
import { Uncertainties } from './Uncertainties';
import { Values } from './Values';

export const ListView = () => {
	return (
		<>
			<CreateIssues />
			<Unassgined />
			<Decisions />
			<Uncertainties />
			<Values />
			<Facts />
		</>
	);
};
