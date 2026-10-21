import { LinkGeometry } from '../../../../utils/buildObjectiveLinkGeometry';
import { cn } from '../../../../utils/cn';

type ObjectiveLinkEdgesProps = {
	geometry: LinkGeometry[];
	selectedLinkId: string | null;
	// Links of this objective are emphasized and drawn on top, so its routes are easy to follow
	emphasizedObjectiveId: string | null;
	onSelectLink: (linkId: string) => void;
};

export const ObjectiveLinkEdges = ({
	geometry,
	selectedLinkId,
	emphasizedObjectiveId,
	onSelectLink,
}: ObjectiveLinkEdgesProps) => {
	const isEmphasized = ({ link }: LinkGeometry) =>
		link.parent_id === emphasizedObjectiveId || link.child_id === emphasizedObjectiveId;
	const drawOrder = geometry.toSorted(
		(a, b) =>
			Number(a.link.id === selectedLinkId) - Number(b.link.id === selectedLinkId) ||
			Number(isEmphasized(a)) - Number(isEmphasized(b)),
	);

	return (
		<svg className='pointer-events-none absolute inset-0 z-10 size-full overflow-visible'>
			<defs>
				<marker
					id='objective-link-arrow'
					viewBox='0 0 8 8'
					refX='8'
					refY='4'
					markerWidth='8'
					markerHeight='8'
					markerUnits='userSpaceOnUse'
					orient='auto'
				>
					<path d='M0,0 L8,4 L0,8 z' className='fill-primary-resting' />
				</marker>
			</defs>
			{drawOrder.map(item => {
				const { link, path } = item;
				const selected = link.id === selectedLinkId;
				const emphasized = isEmphasized(item);
				return (
					<g
						key={link.id}
						className='group/edge'
						onClick={event => {
							event.stopPropagation();
							onSelectLink(link.id);
						}}
					>
						<path
							d={path}
							fill='none'
							markerEnd='url(#objective-link-arrow)'
							className={cn(
								`stroke-primary-resting group-hover/edge:stroke-primary-hover
								[stroke-width:1.5] group-hover/edge:[stroke-width:2.5]`,
								{
									'stroke-primary-hover [stroke-width:2.5]': emphasized,
									'[stroke-width:3]!': selected,
								},
							)}
						/>
						<path
							d={path}
							fill='none'
							stroke='transparent'
							strokeWidth={10}
							className='pointer-events-auto cursor-pointer'
						/>
					</g>
				);
			})}
		</svg>
	);
};
