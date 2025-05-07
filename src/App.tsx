import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router';
import { Layout } from './components/Layout';
import { HomePage } from './components/Homepage/HomePage';

const router = createBrowserRouter(
	createRoutesFromElements(
		<Route element={<Layout />}>
			<Route path='/' element={<HomePage />} />
		</Route>,
	),
);

function App() {
	return <RouterProvider router={router} />;
}

export default App;
