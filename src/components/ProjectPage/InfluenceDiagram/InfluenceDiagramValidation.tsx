import { Accordion, Button, Divider } from '@equinor/eds-core-react';
import { Icon } from '@equinor/eds-core-react';
import { warning_outlined, check_circle_outlined } from '@equinor/eds-icons';

import { useContext, useState } from 'react';
import { ErrorHandlingContext } from '../../context/ErrorHandlingContext';
import { CreateIssues } from '../CreateIssue';

type InfluenceDiagramValidationProps = {
	isHighlightNodesWithNoEdges: boolean;
	isHighlightDecisionNodeWithNoOptions: boolean;
	isHighlightUncertaintyNodeWithNoOutcomes: boolean;
	isHighlightLoops: boolean;
	handleHighlightNodesWithNoEdges: (missing: boolean) => void;
	handleHighlightDecisionNodeWithNoOptions: (missing: boolean) => void;
	handleHighlightUncertaintyNodeWithNoOutcomes: (missing: boolean) => void;
	handleHighlightLoops: (hasLoops: boolean) => void;
};

export const InfluenceDiagramValidation = ({
	isHighlightNodesWithNoEdges,
	isHighlightDecisionNodeWithNoOptions,
	isHighlightUncertaintyNodeWithNoOutcomes,
	isHighlightLoops,
	handleHighlightNodesWithNoEdges,
	handleHighlightDecisionNodeWithNoOptions,
	handleHighlightUncertaintyNodeWithNoOutcomes,
	handleHighlightLoops,
}: InfluenceDiagramValidationProps) => {
	const { errorHandlingState } = useContext(ErrorHandlingContext);
	const [isExpanded, setIsExpanded] = useState(false);
	const [showValidation, setShowValidation] = useState(false);
	const toggleAccordion = (isExpanded: boolean) => {
		setIsExpanded(isExpanded);
	};

	const validationMessages = {
		Issues: {
			warning: 'Your influence diagram is empty.',
			fix: 'Fix: Add issues to begin mapping your decision.',
		},
		Edges: {
			warning: 'Warning: None of the nodes are connected.',
			fix: 'Fix: Add Edges to show how factors influence each other.',
		},
		NoLoops: {
			warning: 'Your diagram has a loop.',
			fix: 'Fix: Remove the cycle so influences only flow forward, not back on themselves.',
		},
		DecisionOptions: {
			warning: 'One or more decisions have no options.',
			fix: 'Fix: Add at least one possible choice for each decision.',
		},
		UncertaintyOutcomes: {
			warning: 'One or more uncertainties have no outcomes.',
			fix: 'Fix: Add possible outcomes to represent what could happen.',
		},
	};
	const handleShowValidation = () => {
		setShowValidation(!showValidation);
	};
	return (
		<div className='absolute top-1 right-1 z-10 w-1/3'>
			<Accordion>
				<Accordion.Item
					isExpanded={isExpanded}
					onExpandedChange={() => toggleAccordion(!isExpanded)}
					hidden={errorHandlingState.message === ''}
				>
					<Accordion.Header>Validation</Accordion.Header>
					<Accordion.Panel>
						<p>Validation and guidelines for building valid influence diagram.</p>
						<Divider />
						{errorHandlingState.message === '' ? (
							<div></div>
						) : (
							<div
								className='flex items-center rounded-md p-3'
								style={{
									backgroundColor: '#FFE7D6',
									border: '2px #FF9200 solid',
								}}
							>
								<Icon data={warning_outlined} size={40} color='#FF9200' />
								<div className='text-text-secondary flex-1 p-3 text-sm'>
									Invalid Influence diagrams cannot compute the decision tree.
								</div>
								<Button onClick={handleShowValidation}>
									{showValidation ? 'Hide' : 'Show'}
								</Button>
							</div>
						)}

						<p className='top-1 mt-4 text-xl'> Influence diagram rules </p>
						<p className='top-1 mt-4 text-sm'>
							{' '}
							These must be satisfied to compute the decision tree.{' '}
						</p>

						{Object.entries(validationMessages).map(([key, message]) => (
							<Accordion.Item
								key={key}
								isExpanded={
									errorHandlingState.message.includes(key) && showValidation
								}
							>
								<Accordion.Header headerLevel='h3'>
									<Accordion.HeaderTitle key={key} className='w-full '>
										<div className='flex flex-col'>
											<div className='flex flex-row'>
												<p className='text-sm'>{key}</p>
												{errorHandlingState.message.includes(key) ? (
													<Icon
														className='mg-r-10'
														data={warning_outlined}
														size={18}
														color='#FF9200'
													/>
												) : (
													<Icon
														className='mg-r-10'
														data={check_circle_outlined}
														size={18}
														color='#00ff08'
													/>
												)}
											</div>
										</div>
									</Accordion.HeaderTitle>
								</Accordion.Header>
								<Accordion.Panel key={key}>
									<div className='flex  flex-row flex-wrap  justify-between'>
										<div>
											<p className='text-sm'>{message.warning}</p>
											<p className='text-sm'>{message.fix}</p>
										</div>
										<div className='ml-3'>
											{key === 'Issues' && <CreateIssues />}
											{key === 'Edges' && (
												<Button
													onClick={() =>
														handleHighlightNodesWithNoEdges(
															!isHighlightNodesWithNoEdges,
														)
													}
												>
													Show Missing Edges
												</Button>
											)}
											{key === 'DecisionOptions' && (
												<Button
													onClick={() =>
														handleHighlightDecisionNodeWithNoOptions(
															!isHighlightDecisionNodeWithNoOptions,
														)
													}
												>
													Show Missing Options
												</Button>
											)}
											{key === 'NoLoops' && (
												<Button
													onClick={() =>
														handleHighlightLoops(!isHighlightLoops)
													}
												>
													Show Loop
												</Button>
											)}
											{key === 'UncertaintyOutcomes' && (
												<Button
													onClick={() =>
														handleHighlightUncertaintyNodeWithNoOutcomes(
															!isHighlightUncertaintyNodeWithNoOutcomes,
														)
													}
												>
													Show Missing Outcomes
												</Button>
											)}
										</div>
									</div>
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
