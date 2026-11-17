import {
	Menu as AriakitMenu,
	MenuButton,
	MenuItem as AriakitMenuItem,
	MenuItemProps,
	MenuProps,
	MenuProvider,
} from '@ariakit/react';
import { Icon, Menu, MenuItem } from '@equinor/eds-core-react/next';
import { chevron_right } from '@equinor/eds-icons';
import { ReactNode } from 'react';
import { cn } from '../../../../utils/cn';

const stopPropagation = (event: React.SyntheticEvent) => event.stopPropagation();

// EDS Menu ships Autocomplete anchor positioning; Ariakit positions it here instead.
// EDS Menu lets className replace its own, so eds-menu is added back.
export const TableMenu = ({ className, ...props }: MenuProps) => (
	<AriakitMenu
		portal
		gutter={4}
		render={<Menu />}
		className={cn(
			'eds-menu nodrag nopan nowheel static z-[1100] max-h-none w-max min-w-40 shadow-md outline-none',
			className,
		)}
		onClick={stopPropagation}
		onPointerDown={stopPropagation}
		onKeyDown={stopPropagation}
		{...props}
	/>
);

export const TableMenuItem = ({ className, ...props }: MenuItemProps) => (
	<AriakitMenuItem
		render={<MenuItem />}
		className={cn('flex items-center justify-between gap-4 whitespace-nowrap', className)}
		{...props}
	/>
);

export const TableSubmenu = ({ label, children }: { label: ReactNode; children: ReactNode }) => (
	<MenuProvider placement='right-start'>
		<TableMenuItem render={<MenuButton render={<MenuItem />} />}>
			{label}
			<Icon data={chevron_right} size='sm' />
		</TableMenuItem>
		<TableMenu gutter={0} shift={-4}>
			{children}
		</TableMenu>
	</MenuProvider>
);
