import { useLocalStorage } from '@uidotdev/usehooks';
import { useEffect } from 'react';

export default function useDarkMode() {
	const [darkMode, setDarkMode] = useLocalStorage('useDarkMode', false);

	const toggleDarkMode = () => {
		setDarkMode(prev => !prev);
	};

	useEffect(() => {
		document.documentElement.classList.toggle('dark', darkMode);
		document.documentElement.dataset.colorScheme = darkMode ? 'dark' : 'light';
		document.documentElement.style.colorScheme = darkMode ? 'dark' : 'light';
	}, [darkMode]);

	return { toggleDarkMode, darkMode };
}
