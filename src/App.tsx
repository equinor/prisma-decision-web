import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router';
import { CreateProjectPage } from './components/CreateProjectPage/CreateProjectPage';
import { HomePage } from './components/Homepage/HomePage';
import { Layout } from './components/Layout';
import { CompactTree } from './components/ProjectPage/CompactTree/CompactTree';
import { DecisionTree } from './components/ProjectPage/DecisionTree/DecisionTree';
import { InfluenceDiagram } from './components/ProjectPage/InfluenceDiagram/InfluenceDiagram';
import { ProjectDetails } from './components/ProjectPage/ProjectDetails/ProjectDetails';
import { ProjectIssues } from './components/ProjectPage/ProjectIssues/ProjectIssues';
import { ProjectObjectives } from './components/ProjectPage/ProjectObjectives/ProjectObjectives';
import { ProjectPage } from './components/ProjectPage/ProjectPage';
import { SolutionTree } from './components/ProjectPage/SolutionTree/SolutionTree';
import { Strategies } from './components/ProjectPage/Strategies/Strategies';
import { Assessments } from './components/ProjectPage/Assessments/Assessments';
import { Whiteboard } from './components/ProjectPage/Whiteboard/Whiteboard';

const router = createBrowserRouter(
	createRoutesFromElements(
		<Route element={<Layout />}>
			<Route path='/' element={<HomePage />} />
			<Route path='/create-project' element={<CreateProjectPage />} />
			<Route path='/project/:projectId/' element={<ProjectPage />}>
				<Route index element={<ProjectDetails />} />
				<Route path='issues' element={<ProjectIssues />} />
				<Route path='objectives' element={<ProjectObjectives />} />
				<Route path='influence-diagram' element={<InfluenceDiagram />} />
				<Route path='whiteboard' element={<Whiteboard />} />
				<Route path='decision-tree' element={<DecisionTree />} />
				<Route path='compact-tree' element={<CompactTree />} />
				<Route path='solution-tree' element={<SolutionTree />} />
				<Route path='strategies' element={<Strategies />} />
				<Route path='assessments' element={<Assessments />} />
			</Route>
		</Route>,
	),
);

function App() {
	return <RouterProvider router={router} />;
}

export default App;
