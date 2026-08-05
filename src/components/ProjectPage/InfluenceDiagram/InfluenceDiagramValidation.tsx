import { Accordion, Button, Divider, Icon, Popover } from '@equinor/eds-core-react';
import { check_circle_outlined, warning_outlined } from '@equinor/eds-icons';
import { useState } from 'react';

import { useHasInfluenceDiagramError } from '../../../hooks/useHasInfluenceDiagramError';

// Validation Rule Item Component
interface ValidationRuleItemProps {
	label: string;
	warning: string;
	fix: string;
	isError: boolean;
}

// Main Component
export const InfluenceDiagramValidation = () => {
	const [showValidation, setShowValidation] = useState(false);
	const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
	const { hasError, validationErrors } = useHasInfluenceDiagramError();

	if (!hasError) return null;
	return (
		<>
			<div className='bg-background-light h-9 w-0.5' />
			<Button
				className='border-warning-resting! hover:bg-warning-resting/20! px-1.5!'
				color='danger'
				ref={setAnchorEl}
				variant='outlined'
				onClick={() => setShowValidation(prev => !prev)}
			>
				<Icon data={warning_outlined} className='fill-warning-resting' />
			</Button>
			<Popover
				open={showValidation}
				anchorEl={anchorEl}
				onClose={() => setShowValidation(false)}
			>
				<Popover.Content>
					<div className='m-1 flex items-center justify-between gap-4'>
						<p>Validation and guidelines for building valid influence diagram.</p>
						<Button onClick={() => setShowValidation(false)}> Hide</Button>
					</div>
					<Divider />

					{/* Error Alert */}
					{hasError && (
						<div className='bg-background-warning border-warning-resting mb-4 flex items-center rounded-md border p-3'>
							<Icon
								data={warning_outlined}
								size={40}
								className='fill-warning-resting'
							/>
							<div className='text-text-warning flex-1 p-3 text-sm'>
								Invalid Influence diagrams cannot compute the decision tree.
							</div>
						</div>
					)}

					<p className='mt-4 text-xl'>Influence diagram rules</p>
					<p className='mt-4 text-sm'>
						These must be satisfied to compute the decision tree.
					</p>

					<Accordion>
						<ValidationRuleItem
							label='Issues'
							warning='Your influence diagram is empty.'
							fix='Add issues to begin mapping your decision.'
							isError={validationErrors.Issues}
						/>
						<ValidationRuleItem
							label='Edges'
							warning='Some or none of the nodes are connected.'
							fix='Add edges to show how factors influence each other.'
							isError={validationErrors.Edges}
						/>
						<ValidationRuleItem
							label='No Loops'
							warning='Your diagram has a loop.'
							fix='Remove the cycle so influences only flow forward.'
							isError={validationErrors.edgesInLoop.length > 0}
						/>
						<ValidationRuleItem
							label='Decision Options'
							warning='One or more decisions have no options.'
							fix='Add at least one possible choice for each decision.'
							isError={validationErrors.DecisionOptions.length > 0}
						/>
						<ValidationRuleItem
							label='Uncertainty Outcomes'
							warning='One or more uncertainties have no outcomes.'
							fix='Add possible outcomes to represent what could happen.'
							isError={validationErrors.UncertaintyOutcomes.length > 0}
						/>
						<ValidationRuleItem
							label='Probability Table'
							warning='Sum of the outcomes must be 1.'
							fix='Add the outcome values that sum up to 1.'
							isError={validationErrors.ProbabilityTable.length > 0}
						/>
					</Accordion>
				</Popover.Content>
			</Popover>
		</>
	);
};

const ValidationRuleItem = ({ label, warning, fix, isError }: ValidationRuleItemProps) => {
	return (
		<Accordion.Item isExpanded={isError}>
			<Accordion.Header headerLevel='h3'>
				<Accordion.HeaderTitle className='w-full'>
					<div className='flex w-full items-center justify-between'>
						<p className='text-base font-bold text-current'>{label}</p>
						{isError ? (
							<span className='flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-700'>
								<Icon data={warning_outlined} color='#FF9200' />
								Error
							</span>
						) : (
							<span className='flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700'>
								<Icon data={check_circle_outlined} color='#22c55e' />
								Pass
							</span>
						)}
					</div>
				</Accordion.HeaderTitle>
			</Accordion.Header>
			<Accordion.Panel>
				{isError ? (
					<div className='flex flex-col gap-3'>
						<div className='rounded-md border border-orange-200 bg-orange-50 p-3'>
							<p className='text-sm text-orange-800'>{warning}</p>
						</div>
						<div className='rounded-md border border-blue-200 bg-blue-50 p-3'>
							<p className='text-sm text-blue-800'>Fix: {fix}</p>
						</div>
					</div>
				) : (
					<p className='text-sm text-green-700'>No issues found.</p>
				)}
			</Accordion.Panel>
		</Accordion.Item>
	);
};
