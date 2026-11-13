import { expect, test } from 'vitest';
import { getDefaultProjectValues, getProjectFromIntake } from './projectDefaults.ts';

const information = {
	project_name: 'North Star',
	opportunity_statement: 'Choose a location.',
	end_date: null,
	public_project: null,
};

test('missing optional fields use unchanged defaults across later turns', () => {
	const defaults = getDefaultProjectValues();
	const before = Date.now();
	const result = getProjectFromIntake(defaults, information);
	const later = getProjectFromIntake(defaults, {
		...information,
		project_name: 'New Name',
	});
	expect(result.end_date).toBe(defaults.end_date);
	expect(later.end_date).toBe(defaults.end_date);
	expect(result.public).toBe(false);
	expect(result.id).toBe(defaults.id);
	expect(later.id).toBe(defaults.id);
	expect(later.name).toBe('New Name');
	expect(result.opportunity_statement).toBe(information.opportunity_statement);
	expect(Math.abs(Date.parse(defaults.end_date) - before - 30 * 86400000) < 1000).toBeTruthy();
});

test('explicit date maps to the same local calendar day and valid ISO timestamp', () => {
	const defaults = getDefaultProjectValues();
	const result = getProjectFromIntake(defaults, {
		...information,
		end_date: '2027-06-01',
		public_project: true,
	});
	const date = new Date(result.end_date);
	expect(date.getFullYear()).toBe(2027);
	expect(date.getMonth()).toBe(5);
	expect(date.getDate()).toBe(1);
	expect(date.getHours()).toBe(0);
	expect(result.end_date).toBe(date.toISOString());
	expect(result.public).toBe(true);
	expect(result.id).toBe(defaults.id);
});

test('explicit private is not replaced by a truthy default', () => {
	const defaults = { ...getDefaultProjectValues(), public: true };
	const result = getProjectFromIntake(defaults, {
		...information,
		public_project: false,
	});
	expect(result.public).toBe(false);
});

test('clearing an explicit date restores the original default, not the previous date', () => {
	const defaults = getDefaultProjectValues();
	getProjectFromIntake(defaults, { ...information, end_date: '2027-06-01' });
	const result = getProjectFromIntake(defaults, information);
	expect(result.end_date).toBe(defaults.end_date);
	expect(result.id).toBe(defaults.id);
});
