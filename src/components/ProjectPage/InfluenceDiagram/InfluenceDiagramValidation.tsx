import { Accordion, Button, Divider, Icon } from '@equinor/eds-core-react';
import { check_circle_outlined, warning_outlined } from '@equinor/eds-icons';
import { MarkerType, Node, Edge as ReactFlowEdge, useReactFlow } from '@xyflow/react';
import { useState } from 'react';

import { useLocation } from 'react-router';
import z from 'zod/v3';
import { useGetDecisionTree } from '../../../hooks/api/useGetDecisionTree';
import { useSelectedProject } from '../../../hooks/useSelectedProject';
import { useSelectedProjectIssues } from '../../../hooks/useSelectedProjectIssues';
import { ErrorHandlingState, InfluenceNode as InfluenceNodeType, Issue } from '../../../validators';
import { CreateIssues } from '../../common/CreateIssue';

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
	issues: Issue[],
): Node<InfluenceNodeType>[] => {
	return nodes.map(node => {
		const isConnected = getNodeConnectivity(node.id, edges);
		const nodeIssueId = node.data.issue_id;
		const issue = issues.find(i => {
			const matchesNode = i.id === nodeIssueId;
			const isDecision = i.type === 'Decision';
			const hasNoOptions = i.decision?.options?.length === 0;

			return matchesNode && isDecision && hasNoOptions;
		});
		if (issue && isConnected) {
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
	issues: Issue[],
): Node<InfluenceNodeType>[] => {
	return nodes.map(node => {
		const isConnected = getNodeConnectivity(node.id, edges);
		const nodeIssueId = node.data.issue_id;
		const issue = issues.find(i => {
			const matchesNode = i.id === nodeIssueId;
			const isUncertainty = i.type === 'Uncertainty';
			const hasNoOutcomes = i.uncertainty?.outcomes?.length === 0;

			return matchesNode && isUncertainty && hasNoOutcomes;
		});

		if (issue && isConnected) {
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
	title: string;
	message: { warning: string; fix: string };
	isError: boolean;
	isExpanded: boolean;
}

const ValidationRuleItem = ({ title, message, isError, isExpanded }: ValidationRuleItemProps) => {
	const { getEdges, setEdges, setNodes, getNodes } = useReactFlow<Node<InfluenceNodeType>>();
	const issues = useSelectedProjectIssues();

	const handleShowMissingEdges = () => {
		const edges = getEdges();
		const nodes = getNodes();
		setNodes(highlightNodesWithMissingEdges(nodes, edges));
	};

	const handleShowMissingOptions = () => {
		const edges = getEdges();
		const nodes = getNodes();
		setNodes(highlightDecisionsWithoutOptions(nodes, edges, issues));
	};

	const handleShowMissingOutcomes = () => {
		const edges = getEdges();
		const nodes = getNodes();
		setNodes(highlightUncertaintiesWithoutOutcomes(nodes, edges, issues));
	};

	const handleShowLoop = () => {
		const edges = getEdges();
		setEdges(highlightLoops(edges));
	};
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
							<Button onClick={handleShowMissingEdges}>Show Missing Edges</Button>
						)}
						{title === 'DecisionOptions' && (
							<Button onClick={handleShowMissingOptions}>Show Missing Options</Button>
						)}
						{title === 'NoLoops' && <Button onClick={handleShowLoop}>Show Loop</Button>}
						{title === 'UncertaintyOutcomes' && (
							<Button onClick={handleShowMissingOutcomes}>
								Show Missing Outcomes
							</Button>
						)}
					</div>
				</div>
			</Accordion.Panel>
		</Accordion.Item>
	);
};
const errorValidator = z.object({
	response: z.object({
		data: z.object({
			detail: z.string(),
		}),
	}),
});

const parseDecisionTreeError = (error: unknown, isError: boolean) => {
	if (!error || !isError) return INITIAL_ERROR_STATE;
	const res = { ...INITIAL_ERROR_STATE };
	const parsedError = errorValidator.safeParse(error);
	if (parsedError.success) {
		res.message = parsedError.data.response.data.detail;
		res.showDecisionTree = true;
	}
	return res;
};

// Main Component
export const InfluenceDiagramValidation = () => {
	const location = useLocation();
	const [isExpanded, setIsExpanded] = useState(location.state?.fromInvalidDiagramDialog || false);
	const [showValidation, setShowValidation] = useState(false);
	const selectedProject = useSelectedProject();
	const { error, isError } = useGetDecisionTree(selectedProject?.id);
	const parsedError = parseDecisionTreeError(error, isError);

	// Event Handlers
	const handleToggleAccordion = (expanded: boolean) => {
		setIsExpanded(expanded);
	};

	const handleToggleValidation = () => {
		setShowValidation(prev => !prev);
	};

	const hasError = parsedError.message !== '';

	useEffect(() => {
		if (!hasError) {
			setIsExpanded(true);
		}
	}, [hasError]);

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
								key={key}
								title={key}
								message={message}
								isError={parsedError.message.includes(key)}
								isExpanded={showValidation}
							/>
						))}

						<Divider />
					</Accordion.Panel>
				</Accordion.Item>
			</Accordion>
		</div>
	);
};
