import { useState } from 'react';
import { Issue } from '../ProjectPage';
import { Decisions } from './Decisions';
import { Facts } from './Facts';
import { Unassgined } from './Unassigned';
import { Uncertainties } from './Uncertainties';
import { Values } from './Values';
import { CreateIssues } from '../CreateIssue';

export const ListView = () => {
	const [issues] = useState(defaultIssues);
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

const defaultIssues: Record<string, Issue[]> = {
	decision: [
		{
			type: 'decision',
			name: 'Decision 1',
			id: crypto.randomUUID(),
			description: '',
		},
		{
			type: 'decision',
			name: 'Decision 2',
			id: crypto.randomUUID(),
			description: '',
		},
		{
			type: 'decision',
			name: 'asdqwdq ',
			id: crypto.randomUUID(),
			description: '',
		},
		{
			type: 'decision',
			name: '2424rfevwef',
			id: crypto.randomUUID(),
			description: '',
		},
		{
			type: 'decision',
			name: 'Decision 2',
			id: crypto.randomUUID(),
			description: '',
		},
	],
	uncertainty: [
		{
			type: 'uncertainty',
			name: 'Uncertainties 3',
			id: crypto.randomUUID(),
			description: '',
		},
		{
			type: 'uncertainty',
			name: 'wefv42fvwef',
			id: crypto.randomUUID(),
			description: '',
		},
		{
			type: 'uncertainty',
			name: 'bgern535b35gb',
			id: crypto.randomUUID(),
			description: '',
		},
	],
	value: [
		{
			type: 'value',
			name: 'Uncertainties 4',
			id: crypto.randomUUID(),
			description: '',
		},
		{
			type: 'value',
			name: 'k768j567hgv5v3gr',
			id: crypto.randomUUID(),
			description: '',
		},
		{
			type: 'value',
			name: 'e5t35bt3tb5',
			id: crypto.randomUUID(),
			description: '',
		},
	],
	fact: [
		{
			type: 'fact',
			name: 'hrt h4tb4hbh4t',
			id: crypto.randomUUID(),
			description: '',
		},
	],
	unassigned: [],
};
