import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router';
import { Layout } from './components/Layout';

const router = createBrowserRouter(
	createRoutesFromElements(
		<Route element={<Layout />}>
			<Route path='/' element={<div>Home</div>} />
		</Route>,
	),
);

function App() {
	return <RouterProvider router={router} />;
}

export default App;
