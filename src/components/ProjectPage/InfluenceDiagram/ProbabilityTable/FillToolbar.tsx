import { MenuButton, MenuProvider } from '@ariakit/react';
import { Banner, Button, Icon, Switch } from '@equinor/eds-core-react/next';
import { info_circle, more_vertical } from '@equinor/eds-icons';
import { useRef } from 'react';
import { DefinitionType } from './probabilityTableMath';
import { TableMenu, TableMenuItem } from './TableMenu';

type FillChoice = Exclude<DefinitionType, 'Manual'>;

/** "Set all rows to": common definitions as buttons, the rest in the more menu */
export const FillToolbar = ({
	disabled,
	keepRowsAtOne,
	onKeepRowsAtOneChange,
	onConvertToManual,
	onFill,
	onClearAll,
}: {
	disabled: boolean;
	keepRowsAtOne: boolean;
	onKeepRowsAtOneChange: (value: boolean) => void;
	onConvertToManual: () => void;
	onFill: (type: FillChoice, anchor: HTMLElement) => void;
	onClearAll: () => void;
}) => {
	const moreRef = useRef<HTMLButtonElement>(null);
	return (
		<div className='flex flex-wrap items-center justify-between gap-x-6 gap-y-2'>
			<div className='flex items-center gap-1' role='toolbar' aria-label='Set all rows to'>
				<span className='mr-1 text-xs text-(--eds-text-secondary)'>Set all rows to</span>
				<Button
					variant='ghost'
					size='small'
					disabled={disabled}
					onClick={onConvertToManual}
				>
					Manual
				</Button>
				{(['Normal', 'Uniform'] as const).map(type => (
					<Button
						key={type}
						variant='ghost'
						size='small'
						disabled={disabled}
						onClick={event => onFill(type, event.currentTarget)}
					>
						{type}
					</Button>
				))}
				<MenuProvider placement='bottom-start'>
					<MenuButton
						ref={moreRef}
						disabled={disabled}
						render={
							<Button
								variant='ghost'
								size='small'
								icon
								aria-label='More fill options'
							/>
						}
					>
						<Icon data={more_vertical} size='sm' />
					</MenuButton>
					<TableMenu>
						<TableMenuItem
							onClick={() => moreRef.current && onFill('Triangular', moreRef.current)}
						>
							Triangular
						</TableMenuItem>
						<TableMenuItem
							onClick={() => moreRef.current && onFill('Expression', moreRef.current)}
						>
							Expression…
						</TableMenuItem>
						<TableMenuItem onClick={onClearAll}>Clear all values</TableMenuItem>
					</TableMenu>
				</MenuProvider>
			</div>
			<KeepRowsAtOneSwitch checked={keepRowsAtOne} onChange={onKeepRowsAtOneChange} />
		</div>
	);
};

export const KeepRowsAtOneSwitch = ({
	checked,
	onChange,
}: {
	checked: boolean;
	onChange: (value: boolean) => void;
}) => (
	<Switch
		label='Keep rows at 1 while typing'
		title='The other unlocked cells in the row change in proportion as you type'
		checked={checked}
		onChange={event => onChange(event.target.checked)}
	/>
);

/** Asks before a fill replaces values someone typed. Not a modal, so the table stays visible. */
export const ConfirmBanner = ({
	message,
	primary,
	secondary,
	onCancel,
}: {
	message: string;
	primary: { label: string; onClick: () => void };
	secondary?: { label: string; onClick: () => void };
	onCancel: () => void;
}) => (
	<Banner tone='info'>
		<Banner.Icon>
			<Icon data={info_circle} />
		</Banner.Icon>
		<Banner.Message>{message}</Banner.Message>
		<Banner.Actions placement='bottom'>
			<Button size='small' onClick={primary.onClick}>
				{primary.label}
			</Button>
			{secondary && (
				<Button size='small' variant='secondary' onClick={secondary.onClick}>
					{secondary.label}
				</Button>
			)}
			<Button size='small' variant='ghost' onClick={onCancel}>
				Cancel
			</Button>
		</Banner.Actions>
	</Banner>
);
