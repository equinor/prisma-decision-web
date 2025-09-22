import { useLocalStorage } from '@uidotdev/usehooks';
import { useEffect } from 'react';

export default function useDarkMode() {
	const [darkMode, setDarkMode] = useLocalStorage('useDarkMode', false);

	const toggleDarkMode = () => {
		setDarkMode(prev => !prev);
	};

	useEffect(() => {
		document.body.classList.toggle('dark', darkMode);
	}, [darkMode]);

	return { toggleDarkMode, darkMode };
}
