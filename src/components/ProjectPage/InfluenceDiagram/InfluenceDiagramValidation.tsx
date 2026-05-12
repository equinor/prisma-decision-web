import { Accordion, Button, Divider, Icon, Popover } from '@equinor/eds-core-react';
import { check_circle_outlined, warning_outlined } from '@equinor/eds-icons';
import { MarkerType, Node, Edge as ReactFlowEdge, useReactFlow } from '@xyflow/react';
import { useState } from 'react';

import { useSelectedProject } from '../../../hooks/useSelectedProject';
import { useSelectedProjectIssues } from '../../../hooks/useSelectedProjectIssues';
import {
	DiscreteProbability,
	InfluenceNode as InfluenceNodeType,
	Issue,
} from '../../../validators';
import { CreateIssues } from '../../common/CreateIssue';

import { useGetInfluenceDiagramErrors } from '../../../hooks/api/useGetInfluenceDiagramErrors';
import { getDiscreteProbabiltyRows } from '../../../utils/getDiscreteProbabiltyRows';
import { calculateRowSum } from './ProbabilityTable/utils';

// Validation Rule Item Component
interface ValidationRuleItemProps {
	title: string;
	message: { label: string; warning: string; fix: string };
	isError: boolean;
	isExpanded: boolean;
}

// Constants

const VALIDATION_MESSAGES = {
	Issues: {
		label: 'Issues',
		warning: 'Your influence diagram is empty.',
		fix: 'Add issues to begin mapping your decision.',
	},
	Edges: {
		label: 'Edges',
		warning: 'Some or none of the nodes are connected.',
		fix: 'Add edges to show how factors influence each other.',
	},
	NoLoops: {
		label: 'No Loops',
		warning: 'Your diagram has a loop.',
		fix: 'Remove the cycle so influences only flow forward.',
	},
	DecisionOptions: {
		label: 'Decision Options',
		warning: 'One or more decisions have no options.',
		fix: 'Add at least one possible choice for each decision.',
	},
	UncertaintyOutcomes: {
		label: 'Uncertainty Outcomes',
		warning: 'One or more uncertainties have no outcomes.',
		fix: 'Add possible outcomes to represent what could happen.',
	},
	ProbalilityTable: {
		label: 'Probability Table',
		warning: 'Sum of the outcomes must be 1.',
		fix: 'Add the outcome values that sum up to 1.',
	},
};

// Helper Functions
const getNodeConnectivity = (nodeId: string, edges: ReactFlowEdge[]): boolean => {
	if (edges.length === 0) return false;

	const hasIncoming = edges.some(edge => edge.target === nodeId);
	const hasOutgoing = edges.some(edge => edge.source === nodeId);

	return hasIncoming || hasOutgoing;
};

const addHighlight = (node: Node<InfluenceNodeType>): Node<InfluenceNodeType> => ({
	...node,
	data: { ...node.data, isHighlighted: 'validation' },
});

const highlightMatchingNodes = (
	nodes: Node<InfluenceNodeType>[],
	shouldHighlight: (node: Node<InfluenceNodeType>) => boolean,
): Node<InfluenceNodeType>[] => {
	return nodes.map(node => (shouldHighlight(node) ? addHighlight(node) : node));
};

const highlightNodesWithMissingEdges = (
	nodes: Node<InfluenceNodeType>[],
	edges: ReactFlowEdge[],
): Node<InfluenceNodeType>[] => {
	if (edges.length > 0) return nodes;
	return highlightMatchingNodes(nodes, () => true);
};

const highlightDecisionsWithoutOptions = (
	nodes: Node<InfluenceNodeType>[],
	edges: ReactFlowEdge[],
	issues: Issue[],
): Node<InfluenceNodeType>[] =>
	highlightMatchingNodes(nodes, node => {
		const issue = issues.find(
			i =>
				i.id === node.data.issue_id &&
				i.type === 'Decision' &&
				i.decision?.options?.length === 0,
		);
		return !!issue && getNodeConnectivity(node.id, edges);
	});

const highlightUncertaintiesWithoutOutcomes = (
	nodes: Node<InfluenceNodeType>[],
	edges: ReactFlowEdge[],
	issues: Issue[],
): Node<InfluenceNodeType>[] =>
	highlightMatchingNodes(nodes, node => {
		const issue = issues.find(
			i =>
				i.id === node.data.issue_id &&
				i.type === 'Uncertainty' &&
				i.uncertainty?.outcomes?.length === 0,
		);
		return !!issue && getNodeConnectivity(node.id, edges);
	});

const highlightUncertaintiesWithUnvalidatedPT = (
	nodes: Node<InfluenceNodeType>[],
	edges: ReactFlowEdge[],
	issues: Issue[],
): Node<InfluenceNodeType>[] => {
	const invalidIssueIds = new Set(getIssuesWithInvalidProbabilityTable(issues).map(i => i.id));
	return highlightMatchingNodes(
		nodes,
		node => invalidIssueIds.has(node.data.issue_id) && getNodeConnectivity(node.id, edges),
	);
};

const highlightLoops = (edges: ReactFlowEdge[]): ReactFlowEdge[] => {
	return edges.map(edge => ({
		...edge,
		style: { stroke: 'orange', strokeWidth: 2 },
		markerEnd: {
			type: MarkerType.ArrowClosed,
			color: 'orange',
		},
	}));
};

const getIssuesWithInvalidProbabilityTable = (issues: Issue[]): Issue[] => {
	return issues.filter(i => {
		const isUncertainty = i.type === 'Uncertainty';
		const hasDiscreteProbability = i.uncertainty?.discrete_probabilities?.length > 0;
		if (!isUncertainty || !hasDiscreteProbability) return false;

		const discreteProbabilities: DiscreteProbability[] = i.uncertainty.discrete_probabilities;
		const { rows } = getDiscreteProbabiltyRows(discreteProbabilities, issues);

		return rows.some(({ probabilities }) => {
			const sum = calculateRowSum(probabilities);

			// Skip unfilled rows (sum === 0)
			if (Number(sum) !== 1) return true;
		});
	});
};

export const ValidateProbabilityTable = (issues: Issue[]): boolean => {
	return getIssuesWithInvalidProbabilityTable(issues).length > 0;
};

const removeHighlight = (node: Node<InfluenceNodeType>): Node<InfluenceNodeType> => {
	const { isHighlighted: _, ...restData } = node.data;
	return { ...node, data: restData as InfluenceNodeType };
};

const clearNodeHighlights = (
	nodes: Node<InfluenceNodeType>[],
	shouldClear: (node: Node<InfluenceNodeType>) => boolean,
): Node<InfluenceNodeType>[] => {
	return nodes.map(node => (shouldClear(node) ? removeHighlight(node) : node));
};

const clearMissingEdgesHighlight = (nodes: Node<InfluenceNodeType>[]): Node<InfluenceNodeType>[] =>
	clearNodeHighlights(nodes, () => true);

const clearDecisionsWithoutOptionsHighlight = (
	nodes: Node<InfluenceNodeType>[],
	edges: ReactFlowEdge[],
	issues: Issue[],
): Node<InfluenceNodeType>[] =>
	clearNodeHighlights(nodes, node => {
		const isConnected = getNodeConnectivity(node.id, edges);
		const issue = issues.find(
			i =>
				i.id === node.data.issue_id &&
				i.type === 'Decision' &&
				i.decision?.options?.length === 0,
		);
		return !!issue && isConnected;
	});

const clearUncertaintiesWithoutOutcomesHighlight = (
	nodes: Node<InfluenceNodeType>[],
	edges: ReactFlowEdge[],
	issues: Issue[],
): Node<InfluenceNodeType>[] =>
	clearNodeHighlights(nodes, node => {
		const isConnected = getNodeConnectivity(node.id, edges);
		const issue = issues.find(
			i =>
				i.id === node.data.issue_id &&
				i.type === 'Uncertainty' &&
				i.uncertainty?.outcomes?.length === 0,
		);
		return !!issue && isConnected;
	});

const clearUnvalidatedPTHighlight = (
	nodes: Node<InfluenceNodeType>[],
	edges: ReactFlowEdge[],
	issues: Issue[],
): Node<InfluenceNodeType>[] => {
	const invalidIssueIds = new Set(getIssuesWithInvalidProbabilityTable(issues).map(i => i.id));
	return clearNodeHighlights(
		nodes,
		node => invalidIssueIds.has(node.data.issue_id) && getNodeConnectivity(node.id, edges),
	);
};

const clearEdgeHighlights = (edges: ReactFlowEdge[]): ReactFlowEdge[] => {
	return edges.map(edge => ({ ...edge, style: undefined, markerEnd: undefined }));
};

const ValidationRuleItem = ({ title, message, isError, isExpanded }: ValidationRuleItemProps) => {
	const { getEdges, setEdges, setNodes, getNodes } = useReactFlow<Node<InfluenceNodeType>>();
	const issues = useSelectedProjectIssues();
	const [highlighted, setHighlighted] = useState(false);

	const actions: Record<string, { label: string; apply: () => void; clear: () => void }> = {
		Edges: {
			label: 'Missing Edges',
			apply: () => setNodes(highlightNodesWithMissingEdges(getNodes(), getEdges())),
			clear: () => setNodes(clearMissingEdgesHighlight(getNodes())),
		},
		DecisionOptions: {
			label: 'Missing Options',
			apply: () => setNodes(highlightDecisionsWithoutOptions(getNodes(), getEdges(), issues)),
			clear: () =>
				setNodes(clearDecisionsWithoutOptionsHighlight(getNodes(), getEdges(), issues)),
		},
		NoLoops: {
			label: 'Loop',
			apply: () => setEdges(highlightLoops(getEdges())),
			clear: () => setEdges(clearEdgeHighlights(getEdges())),
		},
		UncertaintyOutcomes: {
			label: 'Missing Outcomes',
			apply: () =>
				setNodes(highlightUncertaintiesWithoutOutcomes(getNodes(), getEdges(), issues)),
			clear: () =>
				setNodes(
					clearUncertaintiesWithoutOutcomesHighlight(getNodes(), getEdges(), issues),
				),
		},
		ProbalilityTable: {
			label: 'Probability Table',
			apply: () =>
				setNodes(highlightUncertaintiesWithUnvalidatedPT(getNodes(), getEdges(), issues)),
			clear: () => setNodes(clearUnvalidatedPTHighlight(getNodes(), getEdges(), issues)),
		},
	};

	const action = actions[title];

	const handleToggle = () => {
		if (highlighted) {
			action.clear();
			setHighlighted(false);
		} else {
			action.apply();
			setHighlighted(true);
		}
	};

	return (
		<Accordion.Item isExpanded={isError && isExpanded}>
			<Accordion.Header headerLevel='h3'>
				<Accordion.HeaderTitle className='w-full'>
					<div className='flex w-full items-center justify-between'>
						<p className='text-base font-bold text-current'>{message.label}</p>
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
							<p className='text-sm text-orange-800'>{message.warning}</p>
						</div>
						<div className='rounded-md border border-blue-200 bg-blue-50 p-3'>
							<p className='text-sm text-blue-800'>Fix: {message.fix}</p>
						</div>
						<div className='flex justify-end'>
							{title === 'Issues' && <CreateIssues />}
							{action && (
								<Button variant='outlined' onClick={handleToggle}>
									{highlighted ? 'Hide' : 'Show'} {action.label}
								</Button>
							)}
						</div>
					</div>
				) : (
					<p className='text-sm text-green-700'>No issues found.</p>
				)}
			</Accordion.Panel>
		</Accordion.Item>
	);
};

// Main Component
export const InfluenceDiagramValidation = () => {
	const [showValidation, setShowValidation] = useState(false);
	const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
	const selectedProject = useSelectedProject();
	const issues = useSelectedProjectIssues();
	const { data: errors } = useGetInfluenceDiagramErrors(selectedProject?.id);
	const hasInvalidPT = ValidateProbabilityTable(issues);

	const hasError = errors?.message !== '' || hasInvalidPT;

	return (
		<>
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
						{Object.entries(VALIDATION_MESSAGES).map(([key, message]) => (
							<ValidationRuleItem
								key={key}
								title={key}
								message={message}
								isError={
									key === 'ProbalilityTable'
										? hasInvalidPT
										: !!errors?.message.includes(key)
								}
								isExpanded={showValidation}
							/>
						))}
					</Accordion>
				</Popover.Content>
			</Popover>
		</>
	);
};
