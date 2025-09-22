import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router';
import { CreateProjectPage } from './components/CreateProjectPage/CreateProjectPage';
import { HomePage } from './components/Homepage/HomePage';
import { Layout } from './components/Layout';
import { ProjectPage } from './components/ProjectPage/ProjectPage';
import { ProjectIssues } from './components/ProjectPage/ProjectIssues/ProjectIssues';
import { ProjectDetails } from './components/ProjectPage/ProjectDetails/ProjectDetails';
import { ProjectOpportunities } from './components/ProjectPage/ProjectOpportunities/ProjectOpportunities';
import { ProjectObjectives } from './components/ProjectPage/ProjectObjectives/ProjectObjectives';

const router = createBrowserRouter(
	createRoutesFromElements(
		<Route element={<Layout />}>
			<Route path='/' element={<HomePage />} />
			<Route path='/create-project' element={<CreateProjectPage />} />
			<Route path='/project/:projectId/:scenarioId' element={<ProjectPage />}>
				<Route index element={<ProjectDetails />} />
				<Route path='issues' element={<ProjectIssues />} />
				<Route path='opportunities' element={<ProjectOpportunities />} />
				<Route path='objectives' element={<ProjectObjectives />} />
			</Route>
		</Route>,
	),
);

function App() {
	return <RouterProvider router={router} />;
}

export default App;
