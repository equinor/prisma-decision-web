import { describe, expect, it } from 'vitest';
import { issueSchema } from './validators';
import { existingIssue } from './test/issueFixtures';

describe('shared issue validation', () => {
	it('preserves meaningful whitespace without requiring state descriptions, uniqueness or text quality', () => {
		const issue = existingIssue();
		issue.name = ' a ';
		issue.description = ' First line\n\n  Second line ';
		issue.decision.options[0].name = ' a ';
		issue.decision.options.push({
			...issue.decision.options[0],
			id: '00000000-0000-4000-8000-000000000011',
		});
		issue.uncertainty.outcomes[0].name = ' a ';
		issue.uncertainty.outcomes.push({
			...issue.uncertainty.outcomes[0],
			id: '00000000-0000-4000-8000-000000000012',
		});
		expect(issueSchema.parse(issue)).toEqual(issue);
	});

	it('does not impose maximum text lengths', () => {
		const issue = existingIssue();
		issue.name = 'a'.repeat(10000);
		issue.description = 'b'.repeat(10000);
		issue.decision.options[0].name = 'c'.repeat(10000);
		issue.uncertainty.outcomes[0].name = 'd'.repeat(10000);
		expect(issueSchema.safeParse(issue).success).toBe(true);
	});

	it.each(['', ' \t\n '])('rejects a blank issue name: %j', name => {
		const result = issueSchema.safeParse({ ...existingIssue(), name });
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues).toContainEqual(
				expect.objectContaining({ path: ['name'], message: 'Issue name is required' }),
			);
		}
	});

	it.each(['', ' \t\n '])('rejects a blank issue description: %j', description => {
		const result = issueSchema.safeParse({ ...existingIssue(), description });
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues).toContainEqual(
				expect.objectContaining({
					path: ['description'],
					message: 'Issue description is required',
				}),
			);
		}
	});

	it.each(['', ' \t\n '])('rejects blank option and outcome names: %j', name => {
		const issue = existingIssue();
		issue.decision.options[0].name = name;
		issue.uncertainty.outcomes[0].name = name;
		const result = issueSchema.safeParse(issue);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues).toEqual(
				expect.arrayContaining([
					expect.objectContaining({ message: 'Option name is required' }),
					expect.objectContaining({ message: 'Outcome name is required' }),
				]),
			);
		}
	});
});
