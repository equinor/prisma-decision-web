import { Accordion, Button, Divider, Icon } from '@equinor/eds-core-react';
import { warning_outlined, check_circle_outlined } from '@equinor/eds-icons';
import { Node, useReactFlow, Edge as ReactFlowEdge, MarkerType } from '@xyflow/react';
import { useEffect, useState } from 'react';
import { AxiosError } from 'axios';

import { CreateIssues } from '../CreateIssue';
import { useGetDecisionTree } from '../../../hooks/api/useGetDecisionTree';
import { useSelectedScenario } from '../../../hooks/useSelectedScenario';
import { ErrorHandlingState, InfluenceNode as InfluenceNodeType } from '../../../validators';

// Constants
const INITIAL_ERROR_STATE: ErrorHandlingState = {
	message: '',
	showDecisionTree: false,
};

const VALIDATION_STYLE = {
	border: '2px solid orange',
	boxShadow: '0 0 8px 2px orange',
};

const VALIDATION_MESSAGES = {
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
const resetNodesHighlight = (nodes: Node<InfluenceNodeType>[]): Node<InfluenceNodeType>[] => {
	return nodes.map(node => ({
		...node,
		data: {
			...node.data,
			handleClassName: undefined,
		},
	}));
};
// Helper Functions
const getNodeConnectivity = (nodeId: string, edges: ReactFlowEdge[]): boolean => {
	if (edges.length === 0) return false;

	const hasIncoming = edges.some(edge => edge.target === nodeId);
	const hasOutgoing = edges.some(edge => edge.source === nodeId);

	return hasIncoming || hasOutgoing;
};

const highlightNodesWithMissingEdges = (
	nodes: Node<InfluenceNodeType>[],
	edges: ReactFlowEdge[],
): Node<InfluenceNodeType>[] => {
	if (edges.length > 0) return nodes;

	return nodes.map(node => ({
		...node,
		data: {
			...node.data,
			handleClassName: 'bg-red-500! z-1 h-4! w-4!',
		},
	}));
};

const highlightDecisionsWithoutOptions = (
	nodes: Node<InfluenceNodeType>[],
	edges: ReactFlowEdge[],
): Node<InfluenceNodeType>[] => {
	return nodes.map(node => {
		const issue = node.data.node?.issue;
		const isDecision = issue?.type === 'Decision';
		const hasNoOptions = issue?.decision?.options?.length === 0;
		const isConnected = getNodeConnectivity(node.id, edges);

		if (isDecision && hasNoOptions && isConnected) {
			return {
				...node,
				style: VALIDATION_STYLE,
			};
		}

		return node;
	});
};

const highlightUncertaintiesWithoutOutcomes = (
	nodes: Node<InfluenceNodeType>[],
	edges: ReactFlowEdge[],
): Node<InfluenceNodeType>[] => {
	return nodes.map(node => {
		const issue = node.data.node?.issue;
		const isUncertainty = issue?.type === 'Uncertainty';
		const hasNoOutcomes = issue?.uncertainty?.outcomes?.length === 0;
		const isConnected = getNodeConnectivity(node.id, edges);

		if (isUncertainty && hasNoOutcomes && isConnected) {
			return {
				...node,
				style: VALIDATION_STYLE,
			};
		}

		return node;
	});
};

const highlightLoops = (edges: ReactFlowEdge[]): ReactFlowEdge[] => {
	return edges.map(edge => ({
		...edge,
		markerEnd: {
			type: MarkerType.ArrowClosed,
			color: 'rgba(var(--eds_danger), 1)',
		},
	}));
};

// Validation Rule Item Component
interface ValidationRuleItemProps {
	nodes: Node<InfluenceNodeType>[];
	edges: ReactFlowEdge[];
	title: string;
	message: { warning: string; fix: string };
	isError: boolean;
	isExpanded: boolean;
	onShowMissingEdges?: () => void;
	onShowMissingOptions?: () => void;
	onShowMissingOutcomes?: () => void;
	onShowLoop?: () => void;
}

const ValidationRuleItem = ({
	title,
	message,
	isError,
	isExpanded,
	onShowMissingEdges,
	onShowMissingOptions,
	onShowMissingOutcomes,
	onShowLoop,
}: ValidationRuleItemProps) => {
	return (
		<Accordion.Item isExpanded={isError && isExpanded}>
			<Accordion.Header headerLevel='h3'>
				<Accordion.HeaderTitle className='w-full'>
					<div className='flex flex-col'>
						<div className='flex flex-row items-center gap-2'>
							<p className='text-sm'>{title}</p>
							{isError ? (
								<Icon data={warning_outlined} size={18} color='#FF9200' />
							) : (
								<Icon data={check_circle_outlined} size={18} color='#00ff08' />
							)}
						</div>
					</div>
				</Accordion.HeaderTitle>
			</Accordion.Header>
			<Accordion.Panel>
				<div className='flex flex-row flex-wrap justify-between gap-4'>
					<div>
						<p className='text-sm'>{message.warning}</p>
						<p className='text-sm'>{message.fix}</p>
					</div>
					<div>
						{title === 'Issues' && <CreateIssues />}
						{title === 'Edges' && (
							<Button onClick={onShowMissingEdges}>Show Missing Edges</Button>
						)}
						{title === 'DecisionOptions' && (
							<Button onClick={onShowMissingOptions}>Show Missing Options</Button>
						)}
						{title === 'NoLoops' && <Button onClick={onShowLoop}>Show Loop</Button>}
						{title === 'UncertaintyOutcomes' && (
							<Button onClick={onShowMissingOutcomes}>Show Missing Outcomes</Button>
						)}
					</div>
				</div>
			</Accordion.Panel>
		</Accordion.Item>
	);
};

// Main Component
export const InfluenceDiagramValidation = () => {
	const [isExpanded, setIsExpanded] = useState(false);
	const [showValidation, setShowValidation] = useState(false);
	const [errorHandlingState, setErrorHandlingState] =
		useState<ErrorHandlingState>(INITIAL_ERROR_STATE);

	const selectedScenario = useSelectedScenario();
	const { error, isError } = useGetDecisionTree(selectedScenario?.id);
	const { getEdges, setEdges, setNodes, getNodes } = useReactFlow<Node<InfluenceNodeType>>();

	// Handle error state
	useEffect(() => {
		if (isError && error) {
			const err = error as AxiosError;
			if (
				err.response?.data &&
				typeof err.response.data === 'object' &&
				'detail' in err.response.data
			) {
				const errorData = err.response.data as { detail: string };
				setErrorHandlingState({
					message: errorData.detail,
					showDecisionTree: false,
				});
			}
		}
		if (getNodes().length > 0) {
			setNodes(resetNodes());
		}
	}, [isError, error, getNodes]);
	const resetNodes = (): Node<InfluenceNodeType>[] => {
		const nodes = getNodes();

		return nodes.map(node => ({
			...node,
			data: {
				...node.data,
				handleClassName: undefined,
			},
			style: undefined,
		}));
	};
	// Event Handlers
	const handleToggleAccordion = (expanded: boolean) => {
		setIsExpanded(expanded);
	};

	const handleToggleValidation = () => {
		setShowValidation(prev => !prev);
	};

	const handleShowMissingEdges = () => {
		const edges = getEdges();
		const nodes = getNodes();
		setNodes(highlightNodesWithMissingEdges(nodes, edges));
	};

	const handleShowMissingOptions = () => {
		const edges = getEdges();
		const nodes = getNodes();
		setNodes(highlightDecisionsWithoutOptions(nodes, edges));
	};

	const handleShowMissingOutcomes = () => {
		const edges = getEdges();
		const nodes = getNodes();
		setNodes(highlightUncertaintiesWithoutOutcomes(nodes, edges));
	};

	const handleShowLoop = () => {
		const edges = getEdges();
		setEdges(highlightLoops(edges));
	};

	const hasError = errorHandlingState.message !== '';

	return (
		<div className='absolute top-1 right-1 z-10 w-1/3'>
			<Accordion>
				<Accordion.Item
					isExpanded={isExpanded}
					onExpandedChange={handleToggleAccordion}
					hidden={!hasError}
				>
					<Accordion.Header>Validation</Accordion.Header>
					<Accordion.Panel>
						<p>Validation and guidelines for building valid influence diagram.</p>
						<Divider />

						{/* Error Alert */}
						{hasError && (
							<div
								className='mb-4 flex items-center rounded-md p-3'
								style={{
									backgroundColor: '#FFE7D6',
									border: '2px solid #FF9200',
								}}
							>
								<Icon data={warning_outlined} size={40} color='#FF9200' />
								<div className='text-text-secondary flex-1 p-3 text-sm'>
									Invalid Influence diagrams cannot compute the decision tree.
								</div>
								<Button onClick={handleToggleValidation}>
									{showValidation ? 'Hide' : 'Show'}
								</Button>
							</div>
						)}

						<p className='mt-4 text-xl'>Influence diagram rules</p>
						<p className='mt-4 text-sm'>
							These must be satisfied to compute the decision tree.
						</p>

						{/* Validation Rules */}
						{Object.entries(VALIDATION_MESSAGES).map(([key, message]) => (
							<ValidationRuleItem
								nodes={getNodes()}
								edges={getEdges()}
								key={key}
								title={key}
								message={message}
								isError={errorHandlingState.message.includes(key)}
								isExpanded={showValidation}
								onShowMissingEdges={handleShowMissingEdges}
								onShowMissingOptions={handleShowMissingOptions}
								onShowMissingOutcomes={handleShowMissingOutcomes}
								onShowLoop={handleShowLoop}
							/>
						))}

						<Divider />
					</Accordion.Panel>
				</Accordion.Item>
			</Accordion>
		</div>
	);
};
