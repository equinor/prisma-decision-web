import { Accordion, Divider, Button, AccordionHeader } from '@equinor/eds-core-react';
import { Icon } from '@equinor/eds-core-react';
import { warning_outlined, check_circle_outlined } from '@equinor/eds-icons'; // import "save" icon

import { useState } from 'react';

export const InfluenceDiagramValidation = () => {
	const [isExpanded, setIsExpanded] = useState(false);
	const [showFullValidation, setShowFullValidation] = useState(false);
	const toggleAccordion = (isExpanded: boolean) => {
		setIsExpanded(isExpanded);
	};
	const validationMessages = {
		Issues: {
			description:
				'Add at least one issue to the canvas; an empty diagram can’t be used to calculate a decision tree.',
			warning: 'Your influence diagram is empty.',
			fix: 'Fix: Add issues to begin mapping your decision.',
		},
		Arrows: {
			description:
				'Your diagram must include at least one start issue (no incoming arrows) and at least one end node (no outgoing arrows).',
			warning: 'Warning: None of the nodes are connected.',
			fix: 'Fix: Add arrows to show how factors influence each other.',
		},
		NoLoops: {
			description:
				'The diagram must not contain cycles; influences should flow forward, not loop back.',
			warning: 'Your diagram has a loop.',
			fix: 'Fix: Remove the cycle so influences only flow forward, not back on themselves.',
		},
		DecisionOptions: {
			description: 'Every Decision must list one or more Options to choose from.',
			warning: 'One or more decisions have no options.',
			fix: 'Fix: Add at least one possible choice for each decision.',
		},
		UncertaintyOutcomes: {
			description: 'Every Uncertainty must list one or more possible Outcomes.',
			warning: 'One or more uncertainties have no outcomes.',
			fix: 'Fix: Add possible outcomes to represent what could happen.',
		},
	};

	return (
		<div className='absolute top-1 right-1 z-10 w-1/3'>
			<Accordion>
				<Accordion.Item
					isExpanded={isExpanded}
					onExpandedChange={() => toggleAccordion(!isExpanded)}
				>
					<Accordion.Header>Validation</Accordion.Header>
					<Accordion.Panel>
						<p>Validation and guidelines for building valid influence diagram.</p>
						<Divider />
						<div
							className='flex items-center justify-between '
							style={{
								backgroundColor: '#FFE7D6',
								border: '2px #FF9200 solid',
							}}
						>
							<Icon data={warning_outlined} size={40} color='#FF9200' />
							<div className='text-text-secondary p-3 text-sm'>
								Invalid Influence diagrams cannot compute the decision tree.
							</div>
							<Button
								variant='outlined'
								onClick={() => setShowFullValidation(!showFullValidation)}
							>
								{' '}
								{showFullValidation ? 'Hide' : 'Show'}
							</Button>
						</div>

						<p className='top-1 mt-4 text-xl'> Influence diagram rules </p>
						<p className='top-1 mt-4 text-sm'>
							{' '}
							These must be satisfied to compute the decision tree.{' '}
						</p>
						{Object.entries(validationMessages).map(([key, message]) => (
							<Accordion.Item key={key}>
								<Accordion.Header headerLevel='h3'>
									<Accordion.HeaderTitle key={key} className='w-full '>
										<div className='flex flex-col'>
											<div className='flex flex-row'>
												<p className='text-sm'>{key}</p>
												<Icon
													className='mg-r-10'
													data={warning_outlined}
													size={18}
													color='#FF9200'
												/>
												<Icon
													className='mg-r-10'
													data={check_circle_outlined}
													size={18}
													color='#00ff08'
												/>
											</div>
											<p className=' text-xs'>{message.description}</p>
										</div>
									</Accordion.HeaderTitle>
								</Accordion.Header>
								<Accordion.Panel key={key}>
									<p className='text-sm'>{message.warning}</p>
									<p className='text-sm'>{message.fix}</p>
								</Accordion.Panel>
							</Accordion.Item>
						))}
						<Divider />
					</Accordion.Panel>
				</Accordion.Item>
			</Accordion>
		</div>
	);
};
