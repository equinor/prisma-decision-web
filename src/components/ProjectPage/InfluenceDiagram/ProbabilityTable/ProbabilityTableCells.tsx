import { MenuButton, MenuProvider } from '@ariakit/react';
import { Icon, Input, Tooltip } from '@equinor/eds-core-react/next';
import { arrow_drop_down, lock } from '@equinor/eds-icons';
import { useRef, useState } from 'react';
import { cn } from '../../../../utils/cn';
import { showErrorToast } from '../../../ShowToast';
import { TableMenu, TableMenuItem, TableSubmenu } from './TableMenu';
import {
	DefinitionMenuChoice,
	definitionMenuChoices,
	formatProbability,
	MIXED,
	SharedValue,
} from './probabilityFormat';
import { SumFix } from './probabilityTableMath';

const formatSigned = (value: number, decimals?: number) =>
	`${value < 0 ? '−' : '+'}${decimals === undefined ? Number(Math.abs(value).toFixed(4)) : Math.abs(value).toFixed(decimals)}`;

const parseProbability = (text: string) => {
	const normalised = text.trim().replace(',', '.');
	if (!normalised) return undefined;
	const percent = normalised.endsWith('%');
	const value = Number(percent ? normalised.slice(0, -1) : normalised);
	if (!Number.isFinite(value)) return undefined;
	return percent ? value / 100 : value;
};

/** A complete, valid value while typing. "0." or an empty field doesn't count yet. */
const parseDraft = (text: string) => {
	if (/[.,]$/.test(text.trim())) return undefined;
	const value = parseProbability(text);
	return value !== undefined && value >= 0 && value <= 1 ? value : undefined;
};

type ProbabilityInputProps = {
	value: SharedValue;
	label: string;
	disabled: boolean;
	readOnly: boolean;
	locked: boolean;
	readOnlyReason?: string;
	/** Filled by a definition or a model rather than typed: shows a small dot */
	machineFilled?: boolean;
	/** Just changed by the tool to keep the row at 1 */
	adjusted?: boolean;
	onCommit: (value: number) => void;
	onDraftChange?: (value: number | undefined) => void;
	onContextMenu: (event: React.MouseEvent<HTMLElement>) => void;
	onDoubleClick?: () => void;
};

export const ProbabilityInput = ({
	value,
	label,
	disabled,
	readOnly,
	locked,
	readOnlyReason,
	machineFilled,
	adjusted,
	onCommit,
	onDraftChange,
	onContextMenu,
	onDoubleClick,
}: ProbabilityInputProps) => {
	const display = value === MIXED ? '' : formatProbability(value);
	const [draft, setDraft] = useState(display);
	const [shown, setShown] = useState(display);
	if (shown !== display) {
		setShown(display);
		setDraft(display);
	}

	const commit = () => {
		onDraftChange?.(undefined);
		if (draft === display) return;
		const parsed = parseProbability(draft);
		if (parsed === undefined || parsed < 0 || parsed > 1) {
			if (draft.trim() !== '' || value !== MIXED)
				showErrorToast('Enter a probability between 0 and 1.');
			setDraft(display);
			return;
		}
		if (value !== MIXED && parsed === value) {
			setDraft(display);
			return;
		}
		onCommit(parsed);
	};

	return (
		<Input
			aria-label={label}
			title={disabled ? 'Disabled by a restriction on a parent edge.' : readOnlyReason}
			inputMode='decimal'
			value={draft}
			placeholder={value === MIXED ? 'Mix' : undefined}
			disabled={disabled}
			readOnly={readOnly || locked}
			endAdornment={
				locked ? (
					<Icon data={lock} size='sm' />
				) : machineFilled && !disabled ? (
					<span
						aria-hidden
						className='block size-1.25 rounded-full bg-(--eds-text-secondary)'
					/>
				) : undefined
			}
			className={cn(
				'nodrag nopan h-9 min-w-13.25 px-2 [&_.control]:[field-sizing:content] [&_.control]:w-auto [&_.control]:min-w-[4ch] [&_.control]:flex-none [&_.control]:tabular-nums',
				value === MIXED &&
					'[&_.control]:[--_placeholder-text-color:var(--eds-text-primary)]',
				adjusted && 'bg-(--eds-background-non-interactive-accent-muted)!',
			)}
			onChange={event => {
				setDraft(event.target.value);
				onDraftChange?.(parseDraft(event.target.value));
			}}
			onFocus={event => event.currentTarget.select()}
			onBlur={commit}
			onContextMenu={onContextMenu}
			onDoubleClick={readOnly ? onDoubleClick : undefined}
			onKeyDown={event => {
				event.stopPropagation();
				if (event.key === 'Enter') event.currentTarget.blur();
				if (event.key === 'Escape') {
					const input = event.currentTarget;
					setDraft(display);
					onDraftChange?.(undefined);
					requestAnimationFrame(() => input.blur());
				}
			}}
		/>
	);
};

type SumCellProps = {
	sum: number;
	invalidCount: number;
	configurationCount: number;
	outcomes: { name: string; available: boolean }[];
	onFix: (fix: SumFix) => void;
};

export const SumCell = ({
	sum,
	invalidCount,
	configurationCount,
	outcomes,
	onFix,
}: SumCellProps) => {
	if (!invalidCount) {
		if (configurationCount > 1) return null;
		return <span className='px-2 text-sm text-(--eds-text-on-muted-success)'>∑=1</span>;
	}
	const single = configurationCount === 1;
	const difference = 1 - sum;
	const label = single ? `∑=${Number(sum.toFixed(2))}` : `∑≠1 ×${invalidCount}`;

	return (
		<MenuProvider placement='bottom-start'>
			<MenuButton
				className='nodrag h-9 cursor-pointer rounded-sm bg-(--eds-background-interactive-danger-muted-default) px-2 text-sm whitespace-nowrap text-(--eds-text-on-muted-danger) hover:brightness-95 focus-visible:outline-2 focus-visible:outline-(--eds-color-border-focus)'
				title={
					single
						? `The probabilities add up to ${Number(sum.toFixed(4))}, not 1.`
						: `${invalidCount} of ${configurationCount} configurations do not add up to 1.`
				}
			>
				{label}
			</MenuButton>
			<TableMenu>
				<TableMenuItem onClick={() => onFix({ type: 'proportional' })}>
					Normalise proportionally
				</TableMenuItem>
				<TableMenuItem onClick={() => onFix({ type: 'equal' })}>
					{single
						? `Distribute ${formatSigned(difference)} equally`
						: 'Distribute the difference equally'}
				</TableMenuItem>
				<TableSubmenu
					label={
						single
							? `Adjust one outcome by ${formatSigned(difference, 2)}`
							: 'Adjust one outcome'
					}
				>
					{outcomes.map((outcome, index) => (
						<TableMenuItem
							key={outcome.name + index}
							disabled={!outcome.available}
							onClick={() => onFix({ type: 'outcome', index })}
						>
							{outcome.name}
						</TableMenuItem>
					))}
				</TableSubmenu>
			</TableMenu>
		</MenuProvider>
	);
};

type DefinitionButtonProps = {
	label: string;
	/** Tooltip with the definition's settings */
	detail: string;
	emphasised: boolean;
	onSelect: (type: DefinitionMenuChoice, anchor: HTMLElement | null) => void;
};

export const DefinitionButton = ({
	label,
	detail,
	emphasised,
	onSelect,
}: DefinitionButtonProps) => {
	const ref = useRef<HTMLButtonElement>(null);
	return (
		<MenuProvider placement='bottom-end'>
			<Tooltip title={detail} placement='top'>
				<MenuButton
					ref={ref}
					className={cn(
						'nodrag flex h-9 w-full max-w-40 min-w-22.75 cursor-pointer items-center justify-center gap-0.5 rounded-sm bg-(--eds-background-interactive-neutral-muted-default) px-2 text-sm hover:brightness-97 focus-visible:outline-2 focus-visible:outline-(--eds-color-border-focus)',
						emphasised ? 'text-(--eds-text-primary)' : 'text-(--eds-text-secondary)',
					)}
				>
					<span className='truncate'>{label}</span>
					<Icon data={arrow_drop_down} size='sm' className='shrink-0' />
				</MenuButton>
			</Tooltip>
			<TableMenu>
				{definitionMenuChoices.map(choice => (
					<TableMenuItem
						key={choice.type}
						onClick={() => onSelect(choice.type, ref.current)}
					>
						{choice.label}
					</TableMenuItem>
				))}
			</TableMenu>
		</MenuProvider>
	);
};
