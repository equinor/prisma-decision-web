import { zodResolver } from '@hookform/resolvers/zod';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { expect, test, vi } from 'vitest';
import { existingIssue } from '../../../../test/issueFixtures';
import { canDndStartFrom } from '../../../../utils/canDndStartFrom';
import { Issue, issueSchema } from '../../../../validators';
import { IssueCardEditableState } from '../IssueCardEditableState';

const renderState = (type: 'Decision' | 'Uncertainty') => {
	const issue = existingIssue();
	issue.type = type;
	const submitted = vi.fn();
	const Form = () => {
		const form = useForm<Issue>({
			defaultValues: issue,
			resolver: zodResolver(issueSchema),
			mode: 'onChange',
		});
		return (
			<FormProvider {...form} formState={{ ...form.formState, dirtyFields: {}, errors: {} }}>
				<ul>
					<IssueCardEditableState
						index={0}
						isNew={false}
						onSubmit={form.handleSubmit(submitted)}
						onRemove={vi.fn()}
					/>
				</ul>
				<button type='button'>Outside</button>
			</FormProvider>
		);
	};
	render(<Form />);
	return {
		submitted,
		user: userEvent.setup(),
		stateType: type === 'Decision' ? 'option' : 'outcome',
	};
};

test.each([
	['Decision', 'Enter'],
	['Decision', 'blur'],
	['Uncertainty', 'Enter'],
	['Uncertainty', 'blur'],
] as const)(
	'submits %s edits on %s despite a stale context dirty snapshot',
	async (type, action) => {
		const { submitted, user, stateType } = renderState(type);
		await user.click(
			screen.getByRole('button', { name: `Edit ${stateType} name: Existing ${stateType}` }),
		);
		const input = screen.getByRole('textbox', { name: 'Name' });
		expect(canDndStartFrom(input)).toBe(false);
		expect(input.closest('.nodrag')).not.toBeNull();
		const utility = screen.getByRole('spinbutton', { name: 'Utility' });
		expect(canDndStartFrom(utility)).toBe(false);
		expect(utility.closest('.nodrag')).not.toBeNull();
		await user.clear(input);
		await user.type(input, 'Updated state');
		if (action === 'Enter') await user.keyboard('{Enter}');
		else await user.click(screen.getByRole('button', { name: 'Outside' }));
		await waitFor(() => expect(submitted).toHaveBeenCalledOnce());
		const updated: Issue = submitted.mock.calls[0][0];
		const states =
			type === 'Decision' ? updated.decision.options : updated.uncertainty.outcomes;
		expect(states[0].name).toBe('Updated state');
	},
);

test.each(['Decision', 'Uncertainty'] as const)(
	'keeps invalid %s edits open and renders subscribed validation errors',
	async type => {
		const { submitted, user, stateType } = renderState(type);
		await user.click(
			screen.getByRole('button', { name: `Edit ${stateType} name: Existing ${stateType}` }),
		);
		const input = screen.getByRole('textbox', { name: 'Name' });
		await user.clear(input);
		await user.keyboard('{Enter}');
		expect(submitted).not.toHaveBeenCalled();
		expect(input).toHaveAttribute('aria-invalid', 'true');
		expect(canDndStartFrom(input)).toBe(false);
		expect(input.closest('.nodrag')).not.toBeNull();
		expect(await screen.findByText(/name is required/)).toBeInTheDocument();
	},
);
