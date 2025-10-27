import { Accordion, Divider, Button, AccordionHeader } from '@equinor/eds-core-react';
import { Icon } from '@equinor/eds-core-react';
import { warning_outlined } from '@equinor/eds-icons'; // import "save" icon

import { useState } from 'react';

export const InfluenceDiagramValidation = () => {
	const [isExpanded, setIsExpanded] = useState(false);
	const [showFullValidation, setShowFullValidation] = useState(false);
	const toggleAccordion = (isExpanded: boolean) => {
		setIsExpanded(isExpanded);
	};
	const validationMessages = {
		Issues: 'Add at least one issue to the canvas; an empty diagram can’t be used to calculate a decision tree.',
		Arrows: 'Your diagram must include at least one start issue (no incoming arrows) and at least one end node (no outgoing arrows)',
		NoLoops:
			'The diagram must not contain cycles; influences should flow forward, not loop back.',
		DecisionOptions: 'Every Decision must list one or more Options to choose from.',
		UncertaintyOutcomes: 'Every Uncertainty must list one or more possible Outcomes.',
	};
	return (
		<div className='absolute top-1 right-1 z-10 w-1/5'>
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
							className='flex items-center justify-between'
							style={{
								backgroundColor: '#FFE7D6',
								border: '2px #FF9200 solid',
							}}
						>
							<Icon data={warning_outlined} size={40} />
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
								<AccordionHeader key={key}>
									<Icon data={warning_outlined} size={24} />
									<p className='right-10 text-lg'>{key}</p>
								</AccordionHeader>
								<Accordion.Panel key={key}>{message}</Accordion.Panel>
							</Accordion.Item>
						))}
						<Divider />
					</Accordion.Panel>
				</Accordion.Item>
			</Accordion>
		</div>
	);
};
