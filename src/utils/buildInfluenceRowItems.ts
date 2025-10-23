import { Issue, IssueType } from '../validators';

export type InfluenceRowSelection = {
	parentIssueId: string;
	parentIssueName: string;
	parentType: IssueType; // 'Decision' | 'Uncertainty' | others (ignored upstream)
	choiceId: string; // option.id or outcome.id
	choiceName: string; // option.name or outcome.name
};

export type InfluenceRowItem = {
	id: string; // stable key composed from current node and selection ids
	selections: InfluenceRowSelection[]; // one selection per relevant parent (decision/uncertainty)
};

// Simple column and row shapes compatible with TanStack Table's accessorKey API
export type InfluenceTableRow = {
	id: string;
	[columnKey: string]: string; // e.g., p_<parentIssueId> => choiceName
};

/**
 * Build all unique combinations of alternatives (decision options) and outcomes (uncertainties)
 * from the provided parent nodes, producing an array of row items.
 */
export const buildInfluenceRowItems = (parents: Issue[], current: Issue): InfluenceRowItem[] => {
	if (!parents || parents.length === 0) return [];

	// Build choice lists per parent in stable order
	const choiceLists: InfluenceRowSelection[][] = parents
		.map(parent => {
			if (parent.type === 'Decision') {
				return parent.decision.options.map(option => ({
					parentIssueId: parent.id,
					parentIssueName: parent.name,
					parentType: parent.type,
					choiceId: option.id,
					choiceName: option.name,
				}));
			}
			if (parent.type === 'Uncertainty') {
				return parent.uncertainty.outcomes.map(outcome => ({
					parentIssueId: parent.id,
					parentIssueName: parent.name,
					parentType: parent.type,
					choiceId: outcome.id,
					choiceName: outcome.name,
				}));
			}
			return [];
		})
		.filter(list => list.length > 0);

	const product = cartesianProduct(choiceLists);

	return product.map(selections => ({
		id: `${current.id}:${selections.map(s => s.choiceId).join('|')}`,
		selections,
	}));
};

/**
 * Build tabular data (rows + column defs) usable with TanStack Table.
 * - Parent columns (Decision/Uncertainty) use keys p_<issueId>
 * - Current node option columns (if current is Decision) use keys c_<optionId>
 */
export const buildInfluenceTable = (parents: Issue[], current: Issue) => {
	const rowItems = parents.length > 0 ? buildInfluenceRowItems(parents, current) : [];
	const parentColumns = parents
		.filter(
			parent =>
				(parent.uncertainty.outcomes.length > 0 && parent.type === 'Uncertainty') ||
				(parent.decision.options.length > 0 && parent.type === 'Decision'),
		)
		.map(parent => {
			return {
				id: parent.id,
				header: parent.name,
				accessorKey: parent.id,
			};
		});

	const currentOptionColumns =
		current.type === 'Decision'
			? current.decision.options.map(opt => ({
					id: opt.id,
					header: opt.name,
					accessorKey: opt.id,
				}))
			: current.uncertainty.outcomes.map(outcome => ({
					id: outcome.id,
					header: outcome.name,
					accessorKey: outcome.id,
				}));

	const columns = [...parentColumns, ...currentOptionColumns];

	const rows: InfluenceTableRow[] = rowItems.map(item => {
		const row: InfluenceTableRow = { id: item.id };
		for (const sel of item.selections) {
			row[sel.parentIssueId] = sel.choiceName;
		}
		// Initialize current option columns empty (ready for user-calculated values)
		for (const col of currentOptionColumns) {
			if (!(col.accessorKey in row)) row[col.accessorKey] = '';
		}
		return row;
	});

	return { rows, columns };
};

function cartesianProduct<T>(arrays: T[][]): T[][] {
	if (arrays.length === 0) return [];
	return arrays.reduce<T[][]>((acc, curr) => {
		if (acc.length === 0) return curr.map(item => [item]);
		const next: T[][] = [];
		for (const combo of acc) {
			for (const item of curr) {
				next.push([...combo, item]);
			}
		}
		return next;
	}, []);
}
