import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router';
import { CreateProjectPage } from './components/CreateProjectPage/CreateProjectPage';
import { HomePage } from './components/Homepage/HomePage';
import { Layout } from './components/Layout';
import { ProjectDetails } from './components/ProjectPage/ProjectDetails';
import { ProjectPage } from './components/ProjectPage/ProjectPage';
import { ProjectIssues } from './components/ProjectPage/ProjectIssues';

const router = createBrowserRouter(
	createRoutesFromElements(
		<Route element={<Layout />}>
			<Route path='/' element={<HomePage />} />
			<Route path='/create-project' element={<CreateProjectPage />} />
			<Route path='/project/:id' element={<ProjectPage />}>
				<Route index element={<ProjectDetails />} />
				<Route path='issues' element={<ProjectIssues />} />
			</Route>
		</Route>,
	),
);

function App() {
	return <RouterProvider router={router} />;
}

export default App;
