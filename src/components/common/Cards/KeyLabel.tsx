import { Chip } from '@equinor/eds-core-react/next';

export const KeyLabel = ({
	isKey,
	onChange,
}: {
	isKey: boolean;
	onChange?: (isKey: boolean) => void;
}) => (
	<Chip
		data-card-action={onChange ? true : undefined}
		className={
			onChange ? 'pointer-events-auto' : 'cursor-inherit pointer-events-none h-7! py-0!'
		}
		tabIndex={onChange ? undefined : -1}
		aria-label='Key uncertainty'
		aria-pressed={isKey}
		selected={isKey}
		variant={isKey ? 'default' : 'outlined'}
		onClick={() => onChange?.(!isKey)}
	>
		{isKey ? 'Key' : 'Not key'}
	</Chip>
);
