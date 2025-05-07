import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router';
import { Layout } from './components/Layout';
import { HomePage } from './components/Homepage/HomePage';
import { CreateProjectPage } from './components/CreateProjectPage/CreateProjectPage';
import { ProjectIssues } from './components/ProjectIssues';

const router = createBrowserRouter(
	createRoutesFromElements(
		<Route element={<Layout />}>
			<Route path='/' element={<HomePage />} />
			<Route path='/create-project' element={<CreateProjectPage />} />
			<Route path='/project/:id' element={<ProjectIssues />} />
		</Route>,
	),
);

function App() {
	return <RouterProvider router={router} />;
}

export default App;
