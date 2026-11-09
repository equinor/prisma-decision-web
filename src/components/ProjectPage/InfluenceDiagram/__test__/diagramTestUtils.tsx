import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import { AxiosAdapter } from 'axios';
import { Provider } from 'jotai';
import { Toaster } from 'sonner';
import { vi } from 'vitest';
import { existingIssue, project } from '../../../../test/issueFixtures';
import {
	DiscreteProbability,
	Edge,
	Issue,
	Project,
	RestrictionTable,
	SolutionEvidenceResponse,
} from '../../../../validators';
import { ProjectContext } from '../../ProjectContext';
import { InfluenceDiagram } from '../InfluenceDiagram';

export const diagramIssue = (name: string, type: Issue['type'], projectId = project.id): Issue => {
	const issue = existingIssue();
	issue.id = crypto.randomUUID();
	issue.name = name;
	issue.type = type;
	issue.boundary = 'in';
	issue.project_id = projectId;
	issue.decision.type = 'Focus';
	issue.decision.id = crypto.randomUUID();
	issue.decision.issue_id = issue.id;
	issue.decision.project_id = projectId;
	issue.decision.options[0].id = crypto.randomUUID();
	issue.decision.options[0].decision_id = issue.decision.id;
	issue.decision.options[0].project_id = projectId;
	issue.uncertainty.id = crypto.randomUUID();
	issue.uncertainty.issue_id = issue.id;
	issue.uncertainty.project_id = projectId;
	issue.uncertainty.outcomes[0].id = crypto.randomUUID();
	issue.uncertainty.outcomes[0].uncertainty_id = issue.uncertainty.id;
	issue.uncertainty.outcomes[0].project_id = projectId;
	issue.utility.id = crypto.randomUUID();
	issue.utility.issue_id = issue.id;
	issue.utility.project_id = projectId;
	issue.node.id = crypto.randomUUID();
	issue.node.issue_id = issue.id;
	issue.node.project_id = projectId;
	issue.node.node_style.id = crypto.randomUUID();
	issue.node.node_style.node_id = issue.node.id;
	if (issue.value_metric) {
		issue.value_metric.id = crypto.randomUUID();
		issue.value_metric.issue_id = issue.id;
	}
	return issue;
};

export const createDiagramFixture = (selectedProject: Project = project) => {
	const issues = [
		diagramIssue('Drill well', 'Decision', selectedProject.id),
		diagramIssue('Oil price', 'Uncertainty', selectedProject.id),
		diagramIssue('NPV', 'Utility', selectedProject.id),
	];
	const edges: Edge[] = issues.slice(0, 2).map(issue => ({
		id: crypto.randomUUID(),
		project_id: selectedProject.id,
		tail_id: issue.node.id,
		head_id: issues[2].node.id,
	}));
	const probabilities: DiscreteProbability[] = [
		{
			id: crypto.randomUUID(),
			project_id: selectedProject.id,
			uncertainty_id: issues[1].uncertainty.id,
			outcome_id: issues[1].uncertainty.outcomes[0].id,
			parent_option_ids: [],
			parent_outcome_ids: [],
			probability: 1,
		},
	];
	return {
		project: structuredClone(selectedProject),
		issues,
		edges,
		probabilities,
		restrictions: [] as RestrictionTable[],
		evaluations: [] as SolutionEvidenceResponse[][],
		requests: [] as { method: string | undefined; url: string | undefined; data: unknown }[],
	};
};

export const diagramTransport =
	(fixture: ReturnType<typeof createDiagramFixture>): AxiosAdapter =>
	async config => {
		const payload: unknown =
			typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
		fixture.requests.push({ method: config.method, url: config.url, data: payload });
		let data: unknown = [];
		if (config.url === '/issues' && config.method === 'put') {
			const updates: Issue[] = JSON.parse(config.data);
			fixture.issues = fixture.issues.map(
				issue => updates.find(updated => updated.id === issue.id) ?? issue,
			);
		}
		if (config.url?.startsWith('/issues/') && config.method === 'delete') {
			const issueId = config.url.slice('/issues/'.length);
			const nodeId = fixture.issues.find(issue => issue.id === issueId)?.node.id;
			fixture.issues = fixture.issues.filter(issue => issue.id !== issueId);
			fixture.edges = fixture.edges.filter(
				edge => edge.head_id !== nodeId && edge.tail_id !== nodeId,
			);
		}
		if (config.url === '/issues') data = fixture.issues;
		if (config.url === '/nodes') data = fixture.issues.map(issue => issue.node);
		if (config.url === '/edges') data = fixture.edges;
		if (config.url === '/discrete_probabilities') data = fixture.probabilities;
		if (config.url === '/restriction_tables') data = fixture.restrictions;
		if (config.url?.includes('/with_evidence')) {
			const evidence: SolutionEvidenceResponse[] = JSON.parse(config.data);
			fixture.evaluations.push(evidence);
			data = evidence.map(item => ({
				...item,
				expected_utility: item.state_ids.length ? 20 : 10,
			}));
		}
		return { config, status: 200, statusText: 'OK', headers: {}, data: structuredClone(data) };
	};

export const renderInfluenceDiagram = (
	queryClient: QueryClient,
	selectedProject: Project = project,
) =>
	render(
		<Provider>
			<QueryClientProvider client={queryClient}>
				<ProjectContext value={selectedProject}>
					<ReactFlowProvider>
						<InfluenceDiagram />
					</ReactFlowProvider>
				</ProjectContext>
				<Toaster />
			</QueryClientProvider>
		</Provider>,
	);

export const installDiagramDom = () => {
	// jsdom rejects the owning-window proxy in Ariakit's synthetic keyboard click.
	const NativePointerEvent = window.PointerEvent;
	vi.stubGlobal(
		'PointerEvent',
		class extends NativePointerEvent {
			constructor(type: string, init?: PointerEventInit) {
				super(
					type,
					new Proxy(init ?? {}, {
						get: (target, key) => (key === 'view' ? null : Reflect.get(target, key)),
					}),
				);
			}
		},
	);
	const scrollIntoView = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollIntoView');
	Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
		configurable: true,
		value: () => {},
	});
	// Fixed DOM measurements enable ReactFlow interaction in jsdom, not geometry
	// assertions. Wrapping, routes and viewport fitting need a real browser.
	vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(350);
	vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(140);
	vi.stubGlobal(
		'DOMMatrixReadOnly',
		class {
			m22 = 1;
		},
	);
	vi.stubGlobal(
		'ResizeObserver',
		class {
			private observed = new Set<Element>();
			constructor(
				private callback: (
					entries: { target: Element; contentRect: { width: number; height: number } }[],
				) => void,
			) {}
			observe(target: Element) {
				this.observed.add(target);
				queueMicrotask(() => {
					if (this.observed.has(target))
						this.callback([{ target, contentRect: { width: 1024, height: 768 } }]);
				});
			}
			unobserve(target: Element) {
				this.observed.delete(target);
			}
			disconnect() {
				this.observed.clear();
			}
		},
	);
	return () => {
		if (scrollIntoView)
			Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', scrollIntoView);
		else Reflect.deleteProperty(HTMLElement.prototype, 'scrollIntoView');
	};
};
