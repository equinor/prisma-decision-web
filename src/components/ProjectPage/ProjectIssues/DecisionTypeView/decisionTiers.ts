import { DecisionType } from '../../../../validators';

export type DecisionTierConfig = {
	type: DecisionType;
	title: string;
	subtitle: string;
	emphasis: boolean;
};

export const decisionTiers: DecisionTierConfig[] = [
	{ type: 'Policy', title: 'Policy', subtitle: 'Taken as given', emphasis: false },
	{ type: 'Focus', title: 'Strategic', subtitle: 'Focus on in this analysis', emphasis: true },
	{ type: 'Tactical', title: 'Tactical', subtitle: 'Decide later', emphasis: false },
];

export const tierShapeClassName = (tier: DecisionTierConfig, isDropTarget: boolean) => {
	if (tier.emphasis) return isDropTarget ? 'fill-tier-emphasis-hover' : 'fill-tier-emphasis-fill';
	return isDropTarget ? 'fill-tier-fill-hover' : 'fill-tier-fill';
};

export const tierSurfaceClassName = (tier: DecisionTierConfig, isDropTarget: boolean) => {
	if (tier.emphasis) return isDropTarget ? 'bg-tier-emphasis-hover' : 'bg-tier-emphasis-fill';
	return isDropTarget ? 'bg-tier-fill-hover' : 'bg-tier-fill';
};
