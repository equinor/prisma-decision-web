export const stakeholderRegions = {
	consult: {
		label: 'Consult',
		accent: '#d1495b',
		quadrantClassName: 'bg-[rgba(209,73,91,0.12)] border-r border-b',
	},
	partnerClosely: {
		label: 'Partner closely',
		accent: '#007f8b',
		quadrantClassName: 'bg-[rgba(0,127,139,0.12)] border-b',
	},
	observe: {
		label: 'Observe',
		accent: '#5b5bd6',
		quadrantClassName: 'bg-[rgba(91,91,214,0.11)] border-r',
	},
	keepInformed: {
		label: 'Keep informed',
		accent: '#2e8540',
		quadrantClassName: 'bg-[rgba(46,133,64,0.11)]',
	},
} as const;

export type StakeholderRegionKey = keyof typeof stakeholderRegions;

/** Display order of groups in the stakeholder list. */
export const stakeholderListOrder: StakeholderRegionKey[] = [
	'partnerClosely',
	'consult',
	'keepInformed',
	'observe',
];

export const getRegionKey = (
	affectingDecision: number,
	affectedByDecision: number,
): StakeholderRegionKey => {
	if (affectedByDecision >= 0.5) {
		return affectingDecision >= 0.5 ? 'partnerClosely' : 'consult';
	}
	return affectingDecision >= 0.5 ? 'keepInformed' : 'observe';
};

export const STAKEHOLDER_CARD_MIN_WIDTH = 80;
export const STAKEHOLDER_CARD_MAX_WIDTH = 160;
export const STAKEHOLDER_CARD_HEIGHT = 34;

export const clampAxisValue = (value: number) => Math.min(1, Math.max(0, value));
