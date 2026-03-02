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
	message: { warning: string; fix: string };
	isError: boolean;
	isExpanded: boolean;
}

// Constants

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
	ProbalilityTable: {
		warning: 'Sum of the Outcomes must be 1.',
		fix: 'Fix: Add the Outcomes values that sum up to 1 .',
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
const highlightUncertaintiesWithUnvalidatedPT = (
	nodes: Node<InfluenceNodeType>[],
	edges: ReactFlowEdge[],
	issues: Issue[],
): Node<InfluenceNodeType>[] => {
	const invalidIssues = getIssuesWithInvalidProbabilityTable(issues);
	const invalidIssueIds = new Set(invalidIssues.map(i => i.id));

	return nodes.map(node => {
		const isConnected = getNodeConnectivity(node.id, edges);
		const nodeIssueId = node.data.issue_id;
		const hasInvalidPT = invalidIssueIds.has(nodeIssueId);

		if (hasInvalidPT && isConnected) {
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
			if (sum !== 1) return true;
		});
	});
};

const ValidateProbabilityTable = (issues: Issue[]): boolean => {
	return getIssuesWithInvalidProbabilityTable(issues).length > 0;
};

const ValidationRuleItem = ({ title, message, isError, isExpanded }: ValidationRuleItemProps) => {
	const { getEdges, setEdges, setNodes, getNodes } = useReactFlow<Node<InfluenceNodeType>>();
	const issues = useSelectedProjectIssues();
	const edges = getEdges();
	const nodes = getNodes();
	const handleShowMissingEdges = () => {
		setNodes(highlightNodesWithMissingEdges(nodes, edges));
	};

	const handleShowMissingOptions = () => {
		setNodes(highlightDecisionsWithoutOptions(nodes, edges, issues));
	};

	const handleShowMissingOutcomes = () => {
		setNodes(highlightUncertaintiesWithoutOutcomes(nodes, edges, issues));
	};

	const handleShowLoop = () => {
		setEdges(highlightLoops(edges));
	};
	const handleProbabilityTable = () => {
		setNodes(highlightUncertaintiesWithUnvalidatedPT(nodes, edges, issues));
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
						)}{' '}
						{
							<Button onClick={handleProbabilityTable}>
								{' '}
								Show Probability Table{' '}
							</Button>
						}{' '}
					</div>{' '}
				</div>{' '}
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
	const isInValidPT = ValidateProbabilityTable(issues);

	const handleToggleValidation = () => {
		setShowValidation(prev => !prev);
	};

	const hasError = errors?.message !== '' || isInValidPT;

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
					<p>Validation and guidelines for building valid influence diagram.</p>
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
							<Button onClick={handleToggleValidation}>
								{showValidation ? 'Hide' : 'Show'}
							</Button>
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
										? isInValidPT
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
