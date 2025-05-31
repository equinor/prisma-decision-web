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
			description:
				'lorem ipsum dolor sit amet consectetur adipisicing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum',
		},
		{
			type: 'decision',
			name: 'Decision 2',
			id: crypto.randomUUID(),
			description:
				'lorem ipsum dolor sit amet consectetur adipisicing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum',
		},
		{
			type: 'decision',
			name: 'asdqwdq ',
			id: crypto.randomUUID(),
			description:
				'lorem ipsum dolor sit amet consectetur adipisicing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum',
		},
		{
			type: 'decision',
			name: '2424rfevwef',
			id: crypto.randomUUID(),
			description:
				'lorem ipsum dolor sit amet consectetur adipisicing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum',
		},
		{
			type: 'decision',
			name: 'Decision 2',
			id: crypto.randomUUID(),
			description:
				'lorem ipsum dolor sit amet consectetur adipisicing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum',
		},
	],
	uncertainty: [
		{
			type: 'uncertainty',
			name: 'Uncertainties 3',
			id: crypto.randomUUID(),
			description:
				'lorem ipsum dolor sit amet consectetur adipisicing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum',
		},
		{
			type: 'uncertainty',
			name: 'wefv42fvwef',
			id: crypto.randomUUID(),
			description:
				'lorem ipsum dolor sit amet consectetur adipisicing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum',
		},
		{
			type: 'uncertainty',
			name: 'bgern535b35gb',
			id: crypto.randomUUID(),
			description:
				'lorem ipsum dolor sit amet consectetur adipisicing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum',
		},
	],
	value: [
		{
			type: 'value',
			name: 'Uncertainties 4',
			id: crypto.randomUUID(),
			description:
				'lorem ipsum dolor sit amet consectetur adipisicing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum',
		},
		{
			type: 'value',
			name: 'k768j567hgv5v3gr',
			id: crypto.randomUUID(),
			description:
				'lorem ipsum dolor sit amet consectetur adipisicing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum',
		},
		{
			type: 'value',
			name: 'e5t35bt3tb5',
			id: crypto.randomUUID(),
			description:
				'lorem ipsum dolor sit amet consectetur adipisicing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum',
		},
	],
	fact: [
		{
			type: 'fact',
			name: 'hrt h4tb4hbh4t',
			id: crypto.randomUUID(),
			description:
				'lorem ipsum dolor sit amet consectetur adipisicing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum',
		},
	],
	unassigned: [],
};
