import { expect, test } from 'vitest';
import { getChatPageContext } from './chatPageContext.ts';

for (const section of ['objectives', 'issues', 'strategies']) {
	test(`detects ${section} before an interview exists`, () => {
		expect(getChatPageContext(`/project/saved-project/${section}`)).toEqual({
			projectId: 'saved-project',
			currentSection: section,
		});
	});
}

test('handles bottom-navigation double slashes and trailing slashes', () => {
	expect(getChatPageContext('/project/saved-project//issues/')).toEqual({
		projectId: 'saved-project',
		currentSection: 'issues',
	});
});

test('keeps new-project intake on the home page', () => {
	expect(getChatPageContext('/')).toEqual({
		projectId: undefined,
		currentSection: undefined,
	});
});

test('routes the influence-diagram page to its backend section', () => {
	expect(getChatPageContext('/project/saved-project//influence-diagram/')).toEqual({
		projectId: 'saved-project',
		currentSection: 'influence_diagram',
	});
});

test('retains the project on its information and unsupported pages', () => {
	for (const suffix of ['', '/', '/assessments']) {
		expect(getChatPageContext(`/project/saved-project${suffix}`)).toEqual({
			projectId: 'saved-project',
			currentSection: undefined,
		});
	}
});
