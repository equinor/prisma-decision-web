import { Button, Icon } from '@equinor/eds-core-react';
import { link, link_off } from '@equinor/eds-icons';
import { useRef, useState } from 'react';
import {
	childObjectiveType,
	objectiveTypeLabel,
	parentObjectiveType,
} from '../../../../hooks/useObjectiveLinks';
import { Objective, ObjectiveType } from '../../../../validators';
import { ObjectivePickerMenu } from './ObjectivePickerMenu';
import { ObjectiveTypeBadge } from './ObjectiveTypeBadge';

export type LinkedObjective = { linkId: string; objective: Objective };

type ObjectiveLinksPanelProps = {
	objective: Objective;
	contributesTo: LinkedObjective[];
	supportedBy: LinkedObjective[];
	parentOptions: Objective[];
	childOptions: Objective[];
	onLinkParent: (parentId: string) => void;
	onLinkChild: (childId: string) => void;
	onUnlink: (linkId: string) => void;
};

export const ObjectiveLinksPanel = ({
	objective,
	contributesTo,
	supportedBy,
	parentOptions,
	childOptions,
	onLinkParent,
	onLinkChild,
	onUnlink,
}: ObjectiveLinksPanelProps) => {
	const parentType = parentObjectiveType[objective.type];
	const childType = childObjectiveType[objective.type];

	return (
		<div
			className='flex cursor-default flex-col gap-4 px-4 pt-2 pb-4'
			onClick={event => event.stopPropagation()}
		>
			{objective.description && (
				<p className='px-2 text-sm leading-5 break-words'>{objective.description}</p>
			)}
			{parentType && (
				<LinkSection
					title='Contributes to'
					linkType={parentType}
					linked={contributesTo}
					options={parentOptions}
					onLink={onLinkParent}
					onUnlink={onUnlink}
				/>
			)}
			{childType && (
				<LinkSection
					title='Supported by'
					linkType={childType}
					linked={supportedBy}
					options={childOptions}
					onLink={onLinkChild}
					onUnlink={onUnlink}
				/>
			)}
		</div>
	);
};

type LinkSectionProps = {
	title: string;
	linkType: ObjectiveType;
	linked: LinkedObjective[];
	options: Objective[];
	onLink: (objectiveId: string) => void;
	onUnlink: (linkId: string) => void;
};

const LinkSection = ({ title, linkType, linked, options, onLink, onUnlink }: LinkSectionProps) => {
	const linkButtonRef = useRef<HTMLButtonElement>(null);
	const [menuOpen, setMenuOpen] = useState(false);
	const linkLabel = `Link ${objectiveTypeLabel[linkType].toLowerCase()} objective`;

	return (
		<section className='flex flex-col items-start gap-1.5'>
			<h4 className='text-text-secondary text-xs leading-4 font-medium tracking-[0.48px] uppercase'>
				{title}
			</h4>
			{linked.map(({ linkId, objective }) => (
				<div key={linkId} className='flex w-full items-center gap-1'>
					<div
						className='bg-background-default flex min-w-0 flex-1 items-center gap-2 rounded-sm
							border border-[#d4d4d4] py-[7px] pr-[11px] pl-[7px]'
					>
						<ObjectiveTypeBadge type={objective.type} />
						<p className='min-w-0 flex-1 truncate text-sm leading-5 font-medium'>
							{objective.name}
						</p>
					</div>
					<Button
						variant='ghost_icon'
						className='size-8!'
						aria-label={`Remove link to ${objective.name}`}
						title='Remove link'
						onClick={() => onUnlink(linkId)}
					>
						<Icon data={link_off} size={18} />
					</Button>
				</div>
			))}
			<Button
				ref={linkButtonRef}
				variant='ghost'
				className='h-8! text-xs!'
				onClick={() => setMenuOpen(true)}
			>
				<Icon data={link} size={16} />
				{linkLabel}
			</Button>
			{menuOpen && (
				<ObjectivePickerMenu
					anchorEl={linkButtonRef.current}
					title={linkLabel}
					options={options}
					placement='bottom-start'
					onPick={onLink}
					onClose={() => setMenuOpen(false)}
				/>
			)}
		</section>
	);
};
