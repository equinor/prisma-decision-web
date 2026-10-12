import { Menu } from '@equinor/eds-core-react';
import { Chip, ChipTone, ChipVariant, Icon } from '@equinor/eds-core-react/next';
import { check } from '@equinor/eds-icons';
import { ReactNode, useId, useState } from 'react';
import { BoundaryType, DecisionType, decisionTypes, Issue, issueTypes } from '../../../validators';
import { IssueTypeIcon } from '../../common/IssueTypeIcon';

const ClassificationMenu = <Value extends string>({
	title,
	value,
	options,
	onChange,
	disabled,
	getLabel = value => value,
	tone,
	variant,
	dropdown,
	className,
	children,
}: {
	title: string;
	label: string;
	value: Value;
	options: readonly Value[];
	onChange: (value: Value) => void;
	disabled?: boolean;
	getLabel?: (value: Value) => string;
	tone?: ChipTone;
	variant?: ChipVariant;
	dropdown?: boolean;
	className?: string;
	children: ReactNode;
}) => {
	const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
	const [open, setOpen] = useState(false);
	const menuId = useId();

	return (
		<div data-no-dnd className='nodrag nopan pointer-events-auto flex'>
			<Chip
				ref={setAnchor}
				disabled={disabled}
				tone={tone}
				variant={variant}
				dropdown={dropdown}
				className={className}
				selected={dropdown && open}
				onClick={() => setOpen(!open)}
			>
				{children}
			</Chip>
			<Menu
				id={menuId}
				open={open}
				anchorEl={anchor}
				placement='bottom-start'
				onClose={() => setOpen(false)}
				role='menu'
				aria-label={title}
				className='nodrag nopan nowheel pointer-events-auto'
				data-no-dnd
			>
				<h5 className='text-text-secondary px-3 pt-2 text-[10px] font-medium tracking-[1.1px]'>
					{title}
				</h5>
				{options.map(option => (
					<Menu.Item
						key={option}
						active={option === value}
						aria-current={option === value ? 'true' : undefined}
						onClick={() => {
							if (option !== value) onChange(option);
						}}
					>
						<span>{getLabel(option)}</span>
						{option === value && <Icon data={check} />}
					</Menu.Item>
				))}
			</Menu>
		</div>
	);
};

const issueTypeTones: Record<Issue['type'], ChipTone> = {
	Unassigned: 'danger',
	Decision: 'warning',
	Uncertainty: 'success',
	Fact: 'neutral',
	Utility: 'info',
};

export const IssueTypeControl = ({
	issue,
	onChange,
	disabled,
}: {
	issue: Issue;
	onChange: (type: Issue['type']) => void;
	disabled?: boolean;
}) => (
	<ClassificationMenu
		title='ISSUE TYPE'
		label={`Issue type: ${issue.type}`}
		value={issue.type}
		options={issueTypes}
		onChange={onChange}
		disabled={disabled}
		tone={issueTypeTones[issue.type]}
		className='bg-(--eds-color-bg-canvas)! text-(--eds-color-text-neutral-subtle)!'
	>
		<IssueTypeIcon type={issue.type} />
		{issue.type}
	</ClassificationMenu>
);

export const DecisionTypeControl = ({
	issue,
	onChange,
	disabled,
}: {
	issue: Issue;
	onChange: (type: DecisionType) => void;
	disabled?: boolean;
}) =>
	issue.type === 'Decision' && (
		<ClassificationMenu
			title='DECISION TYPE'
			label={`Decision type: ${issue.decision.type}`}
			value={issue.decision.type}
			options={decisionTypes}
			onChange={onChange}
			disabled={disabled}
			dropdown
		>
			{issue.decision.type}
		</ClassificationMenu>
	);

const boundaryLabels = { in: 'In', on: 'On', out: 'Out' };

export const BoundaryControl = ({
	issue,
	onChange,
	disabled,
}: {
	issue: Issue;
	onChange: (boundary: BoundaryType) => void;
	disabled?: boolean;
}) => (
	<ClassificationMenu
		title='BOUNDARY'
		label={`Boundary: ${boundaryLabels[issue.boundary]}`}
		value={issue.boundary}
		options={['in', 'on', 'out']}
		getLabel={boundary => boundaryLabels[boundary]}
		onChange={onChange}
		disabled={disabled}
		variant={issue.boundary === 'in' ? 'default' : 'outlined'}
		className={
			issue.boundary === 'on'
				? 'outline-dashed!'
				: issue.boundary === 'out'
					? 'outline-none!'
					: undefined
		}
	>
		{boundaryLabels[issue.boundary]}
	</ClassificationMenu>
);

export const KeyControl = ({
	issue,
	onClick,
	disabled,
}: {
	issue: Issue;
	onClick: () => void;
	disabled?: boolean;
}) =>
	issue.type === 'Uncertainty' && (
		<Chip
			data-no-dnd
			className='nodrag nopan pointer-events-auto'
			aria-label='Key uncertainty'
			aria-pressed={issue.uncertainty.is_key}
			selected={issue.uncertainty.is_key}
			variant={issue.uncertainty.is_key ? 'default' : 'outlined'}
			onClick={onClick}
			disabled={disabled}
		>
			{issue.uncertainty.is_key && <Icon data={check} size='sm' />}
			{issue.uncertainty.is_key ? 'Key' : 'Not key'}
		</Chip>
	);