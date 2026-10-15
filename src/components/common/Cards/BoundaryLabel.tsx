import { BoundaryType } from '../../../validators';
import { CardLabelMenu } from './CardLabel';

const boundaryLabels = { in: 'In', on: 'On', out: 'Out' };

export const BoundaryLabel = ({ boundary, onChange }: BoundaryLabelProps) => {
	return (
		<CardLabelMenu
			title='BOUNDARY'
			label={`Boundary: ${boundaryLabels[boundary]}`}
			value={boundary}
			options={['in', 'on', 'out']}
			getLabel={boundary => boundaryLabels[boundary]}
			onChange={onChange}
			variant={boundary === 'in' ? 'default' : 'outlined'}
			className={
				boundary === 'on'
					? 'outline-dashed!'
					: boundary === 'out'
						? 'outline-none!'
						: undefined
			}
		>
			{boundaryLabels[boundary]}
		</CardLabelMenu>
	);
};

type BoundaryLabelProps = {
	boundary: BoundaryType;
	onChange?: (boundary: BoundaryType) => void;
};
